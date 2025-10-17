package handlers

import (
	"encoding/json"
	"net/http"
	"webtop-launcher/internal/database"
	"webtop-launcher/internal/middleware"
	"webtop-launcher/internal/models"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"golang.org/x/crypto/bcrypt"
)

func RegisterUserRoutes(router *mux.Router) {
	router.HandleFunc("", GetUsers).Methods("GET")
	router.HandleFunc("", CreateUser).Methods("POST")
	router.HandleFunc("/{id}", UpdateUser).Methods("PUT")
	router.HandleFunc("/{id}/reset-password", ResetPassword).Methods("POST")
	router.HandleFunc("/{id}", DeleteUser).Methods("DELETE")
}

func GetUsers(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query("SELECT id, username, is_admin, created_at FROM users")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	users := []models.User{}
	for rows.Next() {
		var user models.User
		if err := rows.Scan(&user.ID, &user.Username, &user.IsAdmin, &user.CreatedAt); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		users = append(users, user)
	}
	json.NewEncoder(w).Encode(users)
}

func CreateUser(w http.ResponseWriter, r *http.Request) {
	var user models.User
	var creds struct {
		Username string `json:"username"`
		Password string `json:"password"`
		IsAdmin  bool   `json:"isAdmin"`
	}
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(creds.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	user.ID = uuid.New().String()
	user.Username = creds.Username
	user.PasswordHash = string(hashedPassword)
	user.IsAdmin = creds.IsAdmin

	_, err = database.DB.Exec("INSERT INTO users (id, username, password_hash, is_admin) VALUES ($1, $2, $3, $4)", user.ID, user.Username, user.PasswordHash, user.IsAdmin)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(user)
}

func UpdateUser(w http.ResponseWriter, r *http.Request) {
	// Implementation for updating a user
	w.WriteHeader(http.StatusNotImplemented)
}

func ResetPassword(w http.ResponseWriter, r *http.Request) {
	// Implementation for resetting a password
	w.WriteHeader(http.StatusNotImplemented)
}

func DeleteUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	_, err := database.DB.Exec("DELETE FROM users WHERE id = $1", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func RegisterAppRoutes(router *mux.Router) {
	router.HandleFunc("", GetApps).Methods("GET")
	router.HandleFunc("/scrape", ScrapeApps).Methods("POST")
	router.HandleFunc("/{id}", UpdateApp).Methods("PUT")
}

func GetApps(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query("SELECT id, name, logo_url, repository_url, docker_compose, is_enabled, created_at FROM applications")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	apps := []models.Application{}
	for rows.Next() {
		var app models.Application
		if err := rows.Scan(&app.ID, &app.Name, &app.LogoURL, &app.RepositoryURL, &app.DockerCompose, &app.IsEnabled, &app.CreatedAt); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		apps = append(apps, app)
	}
	json.NewEncoder(w).Encode(apps)
}

func ScrapeApps(w http.ResponseWriter, r *http.Request) {
	// This would trigger the Gemini service. For now, it's a placeholder.
	w.WriteHeader(http.StatusNotImplemented)
}

func UpdateApp(w http.ResponseWriter, r *http.Request) {
	var app models.Application
	if err := json.NewDecoder(r.Body).Decode(&app); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	_, err := database.DB.Exec("UPDATE applications SET name = $1, logo_url = $2, repository_url = $3, docker_compose = $4, is_enabled = $5 WHERE id = $6",
		app.Name, app.LogoURL, app.RepositoryURL, app.DockerCompose, app.IsEnabled, app.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(app)
}

func RegisterSessionRoutes(router *mux.Router, adminRouter *mux.Router) {
	// Authenticated routes
	router.Use(middleware.AuthMiddleware)
	router.HandleFunc("", GetUserSessions).Methods("GET")
	router.HandleFunc("/launch", LaunchSession).Methods("POST")
	router.HandleFunc("/{id}/stop", StopSession).Methods("POST")

	// Admin-only routes
	adminRouter.HandleFunc("/sessions", GetAdminSessions).Methods("GET")
}

func GetUserSessions(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(string)
	rows, err := database.DB.Query("SELECT id, user_id, application_id, portainer_stack_id, is_persistent, created_at FROM sessions WHERE user_id = $1", userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	sessions := []models.Session{}
	for rows.Next() {
		var session models.Session
		if err := rows.Scan(&session.ID, &session.UserID, &session.ApplicationID, &session.PortainerStackID, &session.IsPersistent, &session.CreatedAt); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		sessions = append(sessions, session)
	}
	json.NewEncoder(w).Encode(sessions)
}

func GetAdminSessions(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query("SELECT id, user_id, application_id, portainer_stack_id, is_persistent, created_at FROM sessions")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	sessions := []models.Session{}
	for rows.Next() {
		var session models.Session
		if err := rows.Scan(&session.ID, &session.UserID, &session.ApplicationID, &session.PortainerStackID, &session.IsPersistent, &session.CreatedAt); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		sessions = append(sessions, session)
	}
	json.NewEncoder(w).Encode(sessions)
}

func LaunchSession(w http.ResponseWriter, r *http.Request) {
	// This is a complex operation involving Portainer. Placeholder for now.
	w.WriteHeader(http.StatusNotImplemented)
}

func StopSession(w http.ResponseWriter, r *http.Request) {
	// This is a complex operation involving Portainer. Placeholder for now.
	w.WriteHeader(http.StatusNotImplemented)
}

func RegisterPortainerRoutes(router *mux.Router) {
	router.HandleFunc("/deploy", DeployPortainer).Methods("POST")
	router.HandleFunc("/status", GetPortainerStatus).Methods("GET")
}

func DeployPortainer(w http.ResponseWriter, r *http.Request) {
	// This is a complex operation involving Docker. Placeholder for now.
	w.WriteHeader(http.StatusNotImplemented)
}

func GetPortainerStatus(w http.ResponseWriter, r *http.Request) {
	// This is a complex operation involving Docker. Placeholder for now.
	w.WriteHeader(http.StatusNotImplemented)
}
