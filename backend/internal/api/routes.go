package api

import (
  "github.com/gofiber/fiber/v2"
  "webtop-launcher/internal/config"
)

func SetupRoutes(app *fiber.App, cfg *config.Config) {
  app.Get("/api/health", func(c *fiber.Ctx) error {
    return c.JSON(fiber.Map{"status": "ok"})
  })
  RegisterAuthRoutes(app, cfg)
  RegisterApplicationRoutes(app)
  RegisterSessionRoutes(app, cfg)
}
