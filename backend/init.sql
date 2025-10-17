CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE
);
INSERT INTO users (username, password_hash, is_admin)
VALUES ('admin', '$2a$14$Nw0w5uA6xT7fA2z0Zbdx7uKhsPVEzF/YZm4Kzn7O0jMWSzq9h7t7C', true)
ON CONFLICT DO NOTHING;
