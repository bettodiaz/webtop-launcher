package models

import (
	"time"
)

type User struct {
	ID           string    `json:"id"`
	Username     string    `json:"username"`
	PasswordHash string    `json:"-"`
	IsAdmin      bool      `json:"isAdmin"`
	CreatedAt    time.Time `json:"createdAt"`
}

type Application struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	LogoURL       string    `json:"logoUrl"`
	RepositoryURL string    `json:"repositoryUrl"`
	DockerCompose string    `json:"dockerCompose"`
	IsEnabled     bool      `json:"isEnabled"`
	CreatedAt     time.Time `json:"createdAt"`
}

type Session struct {
	ID               string    `json:"id"`
	UserID           string    `json:"userId"`
	ApplicationID    string    `json:"applicationId"`
	PortainerStackID int       `json:"portainerStackId"`
	IsPersistent     bool      `json:"isPersistent"`
	CreatedAt        time.Time `json:"createdAt"`
}

type Settings struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}
