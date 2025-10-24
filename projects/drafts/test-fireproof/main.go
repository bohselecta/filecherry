package main

import (
	"embed"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

//go:embed frontend/dist/*
var frontend embed.FS

func main() {
	// Set Gin to release mode for production
	gin.SetMode(gin.ReleaseMode)
	
	r := gin.Default()
	
	// Serve static files from embedded frontend
	r.StaticFS("/", http.FS(frontend))
	
	// API routes
	api := r.Group("/api")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"status": "ok",
				"message": "Test Fireproof is running!",
				"stack": "Go + Gin",
			})
		})
	}
	
	// Start server
	log.Printf("🚀 Test Fireproof starting on port 3000")
	log.Printf("📊 Stack: Go + Gin")
	log.Printf("🌐 Open http://localhost:3000")
	
	if err := r.Run(":3000"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
