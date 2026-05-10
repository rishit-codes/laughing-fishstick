-- OBJECT 1 — VIEW: trip_budget_summary
CREATE OR REPLACE VIEW trip_budget_summary AS
SELECT 
  t.id AS trip_id,
  t.num_travelers,
  t.total_budget_limit,
  COALESCE(SUM(ts.transport_cost), 0) AS transport_total,
  COALESCE(SUM(ts.accommodation_cost), 0) AS accommodation_total,
  COALESCE(SUM(COALESCE(sa.cost_override, a.avg_cost_usd)), 0) AS activities_total,
  COALESCE(SUM(ts.transport_cost), 0) +
  COALESCE(SUM(ts.accommodation_cost), 0) +
  COALESCE(SUM(COALESCE(sa.cost_override, a.avg_cost_usd)), 0) AS grand_total,
  ROUND(
    (COALESCE(SUM(ts.transport_cost), 0) +
     COALESCE(SUM(ts.accommodation_cost), 0) +
     COALESCE(SUM(COALESCE(sa.cost_override, a.avg_cost_usd)), 0)) 
    / NULLIF(t.num_travelers, 0), 2
  ) AS cost_per_person
FROM trips t
LEFT JOIN trip_stops ts ON ts.trip_id = t.id
LEFT JOIN stop_activities sa ON sa.stop_id = ts.id
LEFT JOIN activities a ON a.id = sa.activity_id
GROUP BY t.id, t.num_travelers, t.total_budget_limit;

-- OBJECT 2 — FUNCTION: get_trip_health_score
CREATE OR REPLACE FUNCTION get_trip_health_score(trip_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  total_stops INTEGER;
  stops_with_accommodation INTEGER;
  gap_exists BOOLEAN := FALSE;
  days_without_activity INTEGER;
  total_days INTEGER;
  budget_set BOOLEAN;
  packing_count INTEGER;
  prev_departure DATE;
  curr_arrival DATE;
  stop_record RECORD;
BEGIN
  -- 25 pts: all stops have accommodation filled
  SELECT COUNT(*) INTO total_stops
  FROM trip_stops WHERE trip_id = trip_uuid;

  SELECT COUNT(*) INTO stops_with_accommodation
  FROM trip_stops 
  WHERE trip_id = trip_uuid 
  AND accommodation_name IS NOT NULL 
  AND accommodation_name != '';

  IF total_stops > 0 AND total_stops = stops_with_accommodation THEN
    score := score + 25;
  END IF;

  -- 25 pts: no date gaps between consecutive stops
  gap_exists := FALSE;
  prev_departure := NULL;
  FOR stop_record IN 
    SELECT arrival_date, departure_date 
    FROM trip_stops 
    WHERE trip_id = trip_uuid 
    ORDER BY stop_order ASC
  LOOP
    IF prev_departure IS NOT NULL THEN
      IF stop_record.arrival_date > prev_departure THEN
        gap_exists := TRUE;
      END IF;
    END IF;
    prev_departure := stop_record.departure_date;
  END LOOP;

  IF NOT gap_exists AND total_stops > 0 THEN
    score := score + 25;
  END IF;

  -- 25 pts: every calendar day has at least one activity
  SELECT 
    (end_date - start_date + 1),
    (end_date - start_date + 1) - COUNT(DISTINCT sa.scheduled_date)
  INTO total_days, days_without_activity
  FROM trips t
  LEFT JOIN trip_stops ts ON ts.trip_id = t.id
  LEFT JOIN stop_activities sa ON sa.stop_id = ts.id
  WHERE t.id = trip_uuid
  GROUP BY t.start_date, t.end_date;

  IF days_without_activity = 0 AND total_days > 0 THEN
    score := score + 25;
  END IF;

  -- 15 pts: budget limit is set
  SELECT (total_budget_limit IS NOT NULL) INTO budget_set
  FROM trips WHERE id = trip_uuid;

  IF budget_set THEN
    score := score + 15;
  END IF;

  -- 10 pts: at least 3 packing items
  SELECT count(*) INTO packing_count FROM packing_items WHERE trip_id = trip_uuid;
  IF packing_count >= 3 THEN
    score := score + 10;
  END IF;

  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- OBJECT 3 — FUNCTION: get_dead_days
CREATE OR REPLACE FUNCTION get_dead_days(trip_uuid uuid) 
RETURNS TABLE(dead_date date, city_name text, city_id integer) AS $$
BEGIN
    RETURN QUERY
    WITH trip_dates AS (
        SELECT generate_series(start_date::timestamp, end_date::timestamp, '1 day'::interval)::date AS d_date
        FROM trips
        WHERE id = trip_uuid
    ),
    city_mapping AS (
        SELECT td.d_date, c.name::text AS c_name, c.id AS c_id
        FROM trip_dates td
        LEFT JOIN trip_stops ts ON ts.trip_id = trip_uuid AND td.d_date >= ts.arrival_date AND td.d_date <= ts.departure_date
        LEFT JOIN cities c ON ts.city_id = c.id
        ORDER BY ts.stop_order
    ),
    distinct_city_mapping AS (
        SELECT DISTINCT ON (d_date) d_date, c_name, c_id
        FROM city_mapping
    )
    SELECT dcm.d_date, dcm.c_name, dcm.c_id
    FROM distinct_city_mapping dcm
    LEFT JOIN (
        SELECT sa.scheduled_date
        FROM stop_activities sa
        JOIN trip_stops ts ON ts.id = sa.stop_id
        WHERE ts.trip_id = trip_uuid
    ) as scheduled ON scheduled.scheduled_date = dcm.d_date
    WHERE scheduled.scheduled_date IS NULL;
END;
$$ LANGUAGE plpgsql;
