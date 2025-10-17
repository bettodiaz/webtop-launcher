package api

import (
  "github.com/gofiber/fiber/v2"
  "webtop-launcher/internal/auth"
  "webtop-launcher/internal/config"
  "webtop-launcher/internal/db"
)

func RegisterAuthRoutes(app *fiber.App, cfg *config.Config) {
  app.Post("/api/auth/login", func(c *fiber.Ctx) error {
    var creds struct {
      Username string `json:"username"`
      Password string `json:"password"`
    }
    if err := c.BodyParser(&creds); err != nil {
      return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
    }

    var user db.User
    if err := db.DB.Where("username = ?", creds.Username).First(&user).Error; err != nil {
      return c.Status(401).JSON(fiber.Map{"error": "invalid credentials"})
    }

    if !auth.CheckPasswordHash(creds.Password, user.PasswordHash) {
      return c.Status(401).JSON(fiber.Map{"error": "invalid credentials"})
    }

    token, _ := auth.GenerateJWT(cfg.JWTSecret, user.Username, user.IsAdmin)
    return c.JSON(fiber.Map{"token": token})
  })
}
