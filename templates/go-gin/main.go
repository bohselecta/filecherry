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
				"message": "{{PROJECT_NAME}} is running!",
				"stack": "{{STACK}}",
			})
		})
	}
	
	// Start server
	log.Printf("🚀 {{PROJECT_NAME}} starting on port {{PORT}}")
	log.Printf("📊 Stack: {{STACK}}")
	log.Printf("🌐 Open http://localhost:{{PORT}}")
	
	if err := r.Run(":{{PORT}}"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
