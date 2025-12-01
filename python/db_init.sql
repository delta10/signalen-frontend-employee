CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS postgis;


CREATE TABLE embeddings (
  id INTEGER PRIMARY KEY,
  embedding vector(768),
  location geometry(Point, 28992) -- EPSG:28992 is the Dutch National Coordinate Projection
);

CREATE TABLE duplicates (
  melding_id_1 INTEGER,
  melding_id_2 INTEGER,
  PRIMARY KEY (melding_id_1, melding_id_2),
  FOREIGN KEY (melding_id_1) REFERENCES embeddings(id),
  FOREIGN KEY (melding_id_2) REFERENCES embeddings(id)
);

CREATE INDEX location_gist ON embeddings USING GIST (location);