-- Initialize grid with 128x128 (16384) white cells
-- Run this in your Supabase SQL Editor

create table grid_state (
  id bigint primary key CHECK (id >= 0 AND id <= 4095),
  color text
);

INSERT INTO grid_state (id, color)
SELECT i, '#FFFFFF'
FROM generate_series(0, 4095) AS s(i)
ON CONFLICT (id) DO UPDATE SET color = '#FFFFFF';
