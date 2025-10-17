package api

import (
  "github.com/gofiber/fiber/v2"
  "webtop-launcher/internal/db"
)

func RegisterApplicationRoutes(app *fiber.App) {
  app.Get("/api/applications", func(c *fiber.Ctx) error {
    var apps []db.Application
    db.DB.Find(&apps)
    return c.JSON(apps)
  })
}
