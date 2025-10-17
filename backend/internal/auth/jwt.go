package auth

import (
  "time"
  "github.com/golang-jwt/jwt/v5"
)

func GenerateJWT(secret, username string, isAdmin bool) (string, error) {
  claims := jwt.MapClaims{
    "username": username,
    "isAdmin":  isAdmin,
    "exp":      time.Now().Add(time.Hour * 72).Unix(),
  }
  token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
  return token.SignedString([]byte(secret))
}
