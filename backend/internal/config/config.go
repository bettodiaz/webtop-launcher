package config

import (
	"os"
)

type Config struct {
	DatabaseURL string
	JWTSecret   string
}

func LoadConfig() (*Config, error) {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://user:password@localhost:5432/webtop?sslmode=disable"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "your-secret-key"
	}

	return &Config{
		DatabaseURL: dbURL,
		JWTSecret:   jwtSecret,
	}, nil
}
