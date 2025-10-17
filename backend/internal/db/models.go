package db

import "time"

type User struct {
  ID           uint   `gorm:"primaryKey"`
  Username     string `gorm:"unique"`
  PasswordHash string
  IsAdmin      bool
}

type Application struct {
  ID            uint   `gorm:"primaryKey"`
  Name          string
  Description   string
  RepositoryURL string
  DockerCompose string
  IsEnabled     bool
}

type Session struct {
  ID           uint      `gorm:"primaryKey"`
  UserID       uint
  AppID        uint
  ContainerID  string
  AccessURL    string
  IsPersistent bool
  StartedAt    time.Time
  EndedAt      *time.Time
}
