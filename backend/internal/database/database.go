package database

import (
	"database/sql"
	"log"
	"golang.org/x/crypto/bcrypt"
)

var DB *sql.DB

func InitDB(dataSourceName string) error {
	var err error
	DB, err = sql.Open("postgres", dataSourceName)
	if err != nil {
		return err
	}

	if err = DB.Ping(); err != nil {
		return err
	}

	log.Println("Database connection established")
	return createTables()
}

func createTables() error {
	// SQL statements from backend_instructions.md
	createUsersTable := `
	CREATE TABLE IF NOT EXISTS users (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		username VARCHAR(255) UNIQUE NOT NULL,
		password_hash VARCHAR(255) NOT NULL,
		is_admin BOOLEAN DEFAULT FALSE,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
	);`

	createApplicationsTable := `
	CREATE TABLE IF NOT EXISTS applications (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		name VARCHAR(255) UNIQUE NOT NULL,
		logo_url TEXT,
		repository_url TEXT,
		docker_compose TEXT NOT NULL,
		is_enabled BOOLEAN DEFAULT TRUE,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
	);`

	createSessionsTable := `
	CREATE TABLE IF NOT EXISTS sessions (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID REFERENCES users(id) ON DELETE CASCADE,
		application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
		portainer_stack_id INT,
		is_persistent BOOLEAN DEFAULT FALSE,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
	);`

	createSettingsTable := `
	CREATE TABLE IF NOT EXISTS settings (
		key VARCHAR(255) PRIMARY KEY,
		value TEXT
	);`

	// Execute all table creation statements
	for _, stmt := range []string{createUsersTable, createApplicationsTable, createSessionsTable, createSettingsTable} {
		_, err := DB.Exec(stmt)
		if err != nil {
			return err
		}
	}

	// Insert default settings if they don't exist
	insertSettings := `
	INSERT INTO settings (key, value) VALUES ('portainer_url', ''), ('portainer_api_key', '')
	ON CONFLICT (key) DO NOTHING;
	`
	_, err := DB.Exec(insertSettings)
	return err
}

// SeedInitialData inserts default users and applications if they do not exist.
func SeedInitialData() error {
	// Default password is 'password' - hashed with bcrypt
	// We'll insert an admin and a normal user, plus example applications.
	// Let the database generate the UUIDs by omitting the id column.
	// Generate bcrypt hashes at runtime to ensure compatibility with the bcrypt implementation
	adminHash, err := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	userHash, err := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	_, err = DB.Exec(`
		INSERT INTO users (username, password_hash, is_admin)
		VALUES
			($1, $2, true),
			($3, $4, false)
		ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;
		`, "admin", string(adminHash), "user", string(userHash))
	if err != nil {
		return err
	}

	_, err = DB.Exec(`
		INSERT INTO applications (name, logo_url, repository_url, docker_compose, is_enabled)
		VALUES
			('VS Code', 'https://cdn.icon-icons.com/icons2/2107/PNG/512/file_type_vscode_icon_130084.png', 'https://github.com/linuxserver/docker-code-server', '...', true),
			('Ubuntu Desktop', 'https://cdn.icon-icons.com/icons2/1508/PNG/512/ubuntu_104494.png', 'https://github.com/linuxserver/docker-webtop', '...', true)
		ON CONFLICT (name) DO NOTHING;
		`)
	return err
}
