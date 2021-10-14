DROP IF EXISTS TABLE guest_reviews;
DROP IF EXISTS TABLE rates;

CREATE TABLE guest_reviews (
  id SERIAL PRIMARY KEY NOT NULL,
  guest_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL DEFAULT 0,
  message TEXT
);

CREATE TABLE rates (
  id SERIAL PRIMARY KEY NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  cost_per_night INTEGER NOT NULL,
  property_id REFERENCES properties(id) ON DELETE CASCADE
);

