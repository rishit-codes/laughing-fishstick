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

  SELECT (total_budget_limit IS NOT NULL) INTO budget_set
  FROM trips WHERE id = trip_uuid;

  IF budget_set THEN
    score := score + 15;
  END IF;

  SELECT COUNT(*) INTO packing_count
  FROM packing_items WHERE trip_id = trip_uuid;

  IF packing_count >= 3 THEN
    score := score + 10;
  END IF;

  RETURN score;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_dead_days(trip_uuid UUID)
RETURNS TABLE(dead_date DATE, city_name TEXT, city_id INTEGER) AS $$
BEGIN
  RETURN QUERY
  WITH trip_dates AS (
    SELECT generate_series(start_date, end_date, '1 day'::interval)::date AS cal_date
    FROM trips WHERE id = trip_uuid
  ),
  city_on_date AS (
    SELECT 
      d.cal_date,
      c.name AS city_name,
      c.id AS city_id
    FROM trip_dates d
    LEFT JOIN trip_stops ts ON (
      d.cal_date >= ts.arrival_date AND d.cal_date <= ts.departure_date
      AND ts.trip_id = trip_uuid
    )
    LEFT JOIN cities c ON c.id = ts.city_id
  ),
  days_with_activities AS (
    SELECT DISTINCT sa.scheduled_date
    FROM trip_stops ts
    JOIN stop_activities sa ON sa.stop_id = ts.id
    WHERE ts.trip_id = trip_uuid
    AND sa.scheduled_date IS NOT NULL
  )
  SELECT 
    cod.cal_date AS dead_date,
    cod.city_name,
    cod.city_id
  FROM city_on_date cod
  WHERE cod.cal_date NOT IN (SELECT scheduled_date FROM days_with_activities)
  AND cod.city_name IS NOT NULL
  ORDER BY cod.cal_date;
END;
$$ LANGUAGE plpgsql;