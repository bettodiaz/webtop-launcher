package main

import (
  "log"
  "webtop-launcher/internal/api"
  "webtop-launcher/internal/config"
  "webtop-launcher/internal/db"

  "github.com/gofiber/fiber/v2"
  "github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
  cfg := config.Load()
  db.Connect(cfg.DatabaseURL)
  app := fiber.New()
  app.Use(cors.New(cors.Config{
    AllowOrigins: "http://localhost:5173, http://localhost",
    AllowHeaders: "Origin, Content-Type, Accept, Authorization",
  }))
  api.SetupRoutes(app, cfg)
  log.Printf("🚀 Backend running on port %s", cfg.Port)
  log.Fatal(app.Listen(":" + cfg.Port))
}
