CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS postgis;


CREATE TABLE embeddings (
  id serial PRIMARY KEY,
  embedding vector(768),
  description text,
  location geometry(Point, 28992) -- EPSG:28992 is the Dutch National Coordinate Projection
);

CREATE INDEX location_gist ON embeddings USING GIST (location);