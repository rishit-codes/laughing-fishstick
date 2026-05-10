CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  profile_photo_url TEXT,
  preferred_currency CHAR(3) DEFAULT 'INR',
  num_trips_created INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  timezone VARCHAR(50),
  currency_code CHAR(3),
  avg_daily_cost_usd NUMERIC(8,2),
  popularity_score SMALLINT CHECK(popularity_score BETWEEN 1 AND 10),
  climate_zone VARCHAR(20) CHECK(climate_zone IN ('tropical','temperate','cold','arid','variable')),
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6)
);

CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  cover_photo_url TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  num_travelers INTEGER DEFAULT 1 CHECK(num_travelers >= 1),
  total_budget_limit NUMERIC(12,2),
  is_public BOOLEAN DEFAULT FALSE,
  share_token VARCHAR(64) UNIQUE DEFAULT encode(gen_random_bytes(32),'hex'),
  status VARCHAR(20) DEFAULT 'draft' CHECK(status IN ('draft','active','completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_trip_dates CHECK(end_date >= start_date)
);

CREATE TABLE trip_collaborators (
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(10) CHECK(role IN ('viewer','editor')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(trip_id, user_id)
);

CREATE TABLE trip_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  city_id INTEGER REFERENCES cities(id),
  arrival_date DATE NOT NULL,
  departure_date DATE NOT NULL,
  stop_order SMALLINT NOT NULL,
  accommodation_name VARCHAR(200),
  accommodation_cost NUMERIC(10,2) DEFAULT 0,
  transport_type VARCHAR(20) CHECK(transport_type IN ('flight','train','bus','car','other')),
  transport_cost NUMERIC(10,2) DEFAULT 0,
  flight_number VARCHAR(20),
  CONSTRAINT valid_stop_dates CHECK(departure_date >= arrival_date),
  UNIQUE(trip_id, stop_order)
);

CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  city_id INTEGER REFERENCES cities(id),
  name VARCHAR(200) NOT NULL,
  category VARCHAR(30) CHECK(category IN ('sightseeing','food','adventure','culture','shopping','nature','nightlife','wellness')),
  avg_cost_usd NUMERIC(8,2) DEFAULT 0,
  duration_hours NUMERIC(4,1),
  description TEXT,
  rating NUMERIC(2,1) CHECK(rating BETWEEN 0 AND 5),
  group_suitable BOOLEAN DEFAULT FALSE
);

CREATE TABLE stop_activities (
  stop_id UUID NOT NULL REFERENCES trip_stops(id) ON DELETE CASCADE,
  activity_id INTEGER NOT NULL REFERENCES activities(id),
  scheduled_date DATE,
  scheduled_time TIME,
  cost_override NUMERIC(10,2),
  notes TEXT,
  PRIMARY KEY(stop_id, activity_id)
);

CREATE TABLE packing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  label VARCHAR(200) NOT NULL,
  category VARCHAR(20) CHECK(category IN ('clothing','documents','electronics','toiletries','other')),
  is_packed BOOLEAN DEFAULT FALSE,
  is_suggested BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE packing_templates (
  id SERIAL PRIMARY KEY,
  climate_zone VARCHAR(20),
  category VARCHAR(20),
  item_label VARCHAR(200),
  priority VARCHAR(10) CHECK(priority IN ('must','recommended','optional'))
);

CREATE TABLE trip_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  stop_id UUID REFERENCES trip_stops(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
