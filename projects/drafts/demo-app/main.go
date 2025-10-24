package main

import (
	"embed"
	"fmt"
	"io"
	"log"
	"net/http"
)

//go:embed static/*
var staticFiles embed.FS

func main() {
	// Create a simple HTTP server
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Serve the embedded HTML file
		file, err := staticFiles.Open("static/index.html")
		if err != nil {
			http.Error(w, "File not found", http.StatusNotFound)
			return
		}
		defer file.Close()
		
		w.Header().Set("Content-Type", "text/html")
		io.Copy(w, file)
	})
	
	http.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"status":"ok","message":"Task Cherry is running!","stack":"Go","size":"12MB"}`)
	})
	
	log.Printf("🍒 Task Cherry starting on port 3000")
	log.Printf("📊 Stack: Go (simple)")
	log.Printf("🌐 Open http://localhost:3000")
	log.Printf("💾 Size: ~12MB executable")
	
	if err := http.ListenAndServe(":3000", nil); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}