-- Initialize grid with 128x128 (16384) white cells
-- Run this in your Supabase SQL Editor

create table grid_state (
  id bigint primary key CHECK (id >= 0 AND id <= 4095),
  color text CHECK (color ~* '^#([0-9a-f]{3}|[0-9a-f]{6})$')
);

INSERT INTO grid_state (id, color)
SELECT i, '#' || lpad(to_hex(floor(random() * 16777216)::int), 6, '0')
FROM generate_series(0, 4095) AS s(i)
ON CONFLICT (id) DO UPDATE SET color = EXCLUDED.color;
