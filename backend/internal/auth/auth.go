package auth

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"webtop-launcher/internal/config"
	"webtop-launcher/internal/database"
	"webtop-launcher/internal/models"

	"webtop-launcher/internal/middleware"

	"github.com/dgrijalva/jwt-go"
	"github.com/gorilla/mux"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey []byte

func init() {
	cfg, err := config.LoadConfig()
	if err != nil {
		panic(err)
	}
	jwtKey = []byte(cfg.JWTSecret)
}

type Credentials struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// RegisterAuthRoutes registers authentication-related routes.
func RegisterAuthRoutes(router *mux.Router) {
	router.HandleFunc("/login", LoginHandler).Methods("POST")
	// change-password requires authentication - wrap the handler with middleware
	router.Handle("/change-password", middleware.AuthMiddleware(http.HandlerFunc(ChangePasswordHandler))).Methods("POST")
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var creds Credentials
	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Log login attempts for debugging (do not keep verbose logging in production)
	log.Printf("Login attempt: username=%s remote=%s password_len=%d", creds.Username, r.RemoteAddr, len(creds.Password))

	user := &models.User{}
	err = database.DB.QueryRow("SELECT id, username, password_hash, is_admin FROM users WHERE username = $1", creds.Username).Scan(&user.ID, &user.Username, &user.PasswordHash, &user.IsAdmin)
	if err != nil {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}

	// Log stored hash info for debugging
	log.Printf("Stored hash length=%d prefix=%.20s", len(user.PasswordHash), user.PasswordHash)

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(creds.Password)); err != nil {
		// Detailed debug log to help diagnose why password compare fails.
		// WARNING: do not leave verbose password logs enabled in production.
		log.Printf("Password compare failed for user=%s: %v", creds.Username, err)
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}

	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &jwt.StandardClaims{
		Subject:   user.ID,
		ExpiresAt: expirationTime.Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		http.Error(w, "Could not generate token", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"token": tokenString})
}

func ChangePasswordHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(string)
	var creds struct {
		CurrentPassword string `json:"currentPassword"`
		NewPassword     string `json:"newPassword"`
	}
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var passwordHash string
	err := database.DB.QueryRow("SELECT password_hash FROM users WHERE id = $1", userID).Scan(&passwordHash)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(creds.CurrentPassword))
	if err != nil {
		http.Error(w, "Invalid current password", http.StatusUnauthorized)
		return
	}

	newPasswordHash, err := bcrypt.GenerateFromPassword([]byte(creds.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Could not hash new password", http.StatusInternalServerError)
		return
	}

	_, err = database.DB.Exec("UPDATE users SET password_hash = $1 WHERE id = $2", string(newPasswordHash), userID)
	if err != nil {
		http.Error(w, "Could not update password", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
