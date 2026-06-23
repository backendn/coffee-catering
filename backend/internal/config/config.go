package config

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

// Config holds all environment-driven settings for the application.
// Values are read once at startup via Load().
type Config struct {
	Port          string
	DBUrl         string
	JWTSecret     string
	ResendAPIKey  string
	ResendFrom    string
	CloudinaryURL string
	AllowedOrigins []string
	Env           string // "development" | "production"
}

// Load reads environment variables (and .env file if present, for local
// non-docker runs) and returns a populated Config. It panics if a required
// variable is missing, since the app cannot run correctly without it.
func Load() *Config {
	// .env is optional — in Docker, env vars come from docker-compose directly.
	if err := godotenv.Load(); err != nil {
		log.Println("no .env file found, relying on environment variables")
	}

	cfg := &Config{
		Port:           getEnv("PORT", "8080"),
		DBUrl:          mustGetEnv("DB_URL"),
		JWTSecret:      mustGetEnv("JWT_SECRET"),
		ResendAPIKey:   getEnv("RESEND_API_KEY", ""),
		ResendFrom:     getEnv("RESEND_FROM", "orders@yourdomain.com"),
		CloudinaryURL:  getEnv("CLOUDINARY_URL", ""),
		AllowedOrigins: strings.Split(getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:5173"), ","),
		Env:            getEnv("ENV", "development"),
	}

	return cfg
}

func getEnv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return fallback
}

func mustGetEnv(key string) string {
	v, ok := os.LookupEnv(key)
	if !ok || v == "" {
		log.Fatalf("required environment variable %s is not set", key)
	}
	return v
}