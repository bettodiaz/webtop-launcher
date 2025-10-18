package main

import (
	"log"
	"net/http"
	"os"

	"webtop-launcher/internal/auth"
	"webtop-launcher/internal/config"
	"webtop-launcher/internal/database"
	"webtop-launcher/internal/handlers"
	"webtop-launcher/internal/middleware"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Could not load configuration: %v", err)
	}

	// Initialize database connection
	err = database.InitDB(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Could not connect to the database: %v", err)
	}
	defer database.DB.Close()

	// Optional seeding (set SEED=true in environment to seed default users/apps)
	if os.Getenv("SEED") == "true" {
		log.Println("Seeding initial data...")
		if err := database.SeedInitialData(); err != nil {
			log.Fatalf("Failed to seed data: %v", err)
		}
	}

	r := mux.NewRouter().StrictSlash(true)

	// Simple CORS for demo/homelab usage
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			next.ServeHTTP(w, r)
		})
	})

	// API routes
	api := r.PathPrefix("/api").Subrouter()

	// Authentication routes
	authRouter := api.PathPrefix("/auth").Subrouter()
	auth.RegisterAuthRoutes(authRouter)

	// Admin routes with auth middleware
	adminRouter := api.PathPrefix("/admin").Subrouter()
	adminRouter.Use(middleware.AuthMiddleware)

	// User management routes
	userRouter := adminRouter.PathPrefix("/users").Subrouter()
	handlers.RegisterUserRoutes(userRouter)

	// Application management routes
	appRouter := adminRouter.PathPrefix("/apps").Subrouter()
	handlers.RegisterAppRoutes(appRouter)

	// Portainer management routes
	portainerRouter := adminRouter.PathPrefix("/portainer").Subrouter()
	handlers.RegisterPortainerRoutes(portainerRouter)

	// Session management routes (some are protected, some are not)
	sessionRouter := api.PathPrefix("/sessions").Subrouter()
	handlers.RegisterSessionRoutes(sessionRouter, adminRouter)

	// Public-facing application list route
	appsListRouter := api.PathPrefix("/apps").Subrouter()
	appsListRouter.Use(middleware.AuthMiddleware)
	appsListRouter.HandleFunc("", handlers.GetApps).Methods("GET")

	log.Println("Starting server on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
