package config

import (
  "os"
)

type Config struct {
  Port         string
  DatabaseURL  string
  JWTSecret    string
  PortainerURL string
  PortainerKey string
}

func Load() *Config {
  return &Config{
    Port:         getenv("PORT", "8080"),
    DatabaseURL:  getenv("DATABASE_URL", "postgres://postgres:postgres@db:5432/webtop?sslmode=disable"),
    JWTSecret:    getenv("JWT_SECRET", "supersecretkey"),
    PortainerURL: getenv("PORTAINER_URL", "http://portainer:9000/api"),
    PortainerKey: getenv("PORTAINER_KEY", "changeme"),
  }
}

func getenv(key, fallback string) string {
  if val := os.Getenv(key); val != "" {
    return val
  }
  return fallback
}
