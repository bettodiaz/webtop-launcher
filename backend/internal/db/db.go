package db

import (
  "log"
  "gorm.io/driver/postgres"
  "gorm.io/gorm"
)

var DB *gorm.DB

func Connect(url string) {
  var err error
  DB, err = gorm.Open(postgres.Open(url), &gorm.Config{})
  if err != nil {
    log.Fatal("❌ Database connection failed:", err)
  }
  log.Println("✅ Connected to PostgreSQL")
  DB.AutoMigrate(&User{}, &Application{}, &Session{})
}
