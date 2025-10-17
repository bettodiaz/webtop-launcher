package api

import (
  "github.com/gofiber/fiber/v2"
  "webtop-launcher/internal/config"
  "webtop-launcher/internal/db"
  "webtop-launcher/internal/portainer"
)

func RegisterSessionRoutes(app *fiber.App, cfg *config.Config) {
  app.Get("/api/session", func(c *fiber.Ctx) error {
    var sessions []db.Session
    db.DB.Find(&sessions)
    return c.JSON(sessions)
  })

  app.Post("/api/session", func(c *fiber.Ctx) error {
    var req struct {
      AppID uint `json:"appId"`
    }
    if err := c.BodyParser(&req); err != nil {
      return c.Status(400).JSON(fiber.Map{"error": "bad request"})
    }

    var appRec db.Application
    if err := db.DB.First(&appRec, req.AppID).Error; err != nil {
      return c.Status(404).JSON(fiber.Map{"error": "app not found"})
    }

    contID, err := portainer.LaunchContainer(cfg.PortainerURL, cfg.PortainerKey, portainer.ContainerConfig{
      Image: "lscr.io/linuxserver/code-server:latest",
      Labels: map[string]string{"traefik.enable": "true"},
    })
    if err != nil {
      return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }

    session := db.Session{
      AppID: appRec.ID,
      UserID: 1,
      ContainerID: contID,
      AccessURL: "http://localhost", // adjust if Traefik routes dynamically
    }
    db.DB.Create(&session)
    return c.JSON(session)
  })

  app.Delete("/api/session/:id", func(c *fiber.Ctx) error {
    id := c.Params("id")
    db.DB.Delete(&db.Session{}, id)
    return c.SendStatus(204)
  })
}
