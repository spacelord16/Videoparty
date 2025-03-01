package main

import (
    "log"
    "os"
    "github.com/joho/godotenv"
    "github.com/gin-gonic/gin"
    "github.com/spacelord16/Videoparty/internal/db"
    "github.com/spacelord16/Videoparty/internal/api"
)

func main() {
    // Load environment variables
    err := godotenv.Load("/mnt/d/Videoparty/Videoparty/.env")
    if err != nil {
        log.Fatalf("Error loading .env file: %s", err)
    }

    // Initialize the database
    database, err := db.InitDB()
    if err != nil {
        log.Fatalf("Failed to connect to database: %s", err)
    }
    defer database.Close()

    // Initialize the router
    router := gin.Default()

    // Set up routes
    router.POST("/register", func(c *gin.Context) {
        api.RegisterUser(c, database)
    })
    router.POST("/login", func(c *gin.Context) {
        api.LoginUser(c, database)
    })

    // Start the server
    if err := router.Run(":8080"); err != nil {
        log.Fatal("Failed to run server:", err)
    }

    // Debugging print to ensure DB_HOST is loaded
    dbHost := os.Getenv("DB_HOST")
    log.Println("Database Host:", dbHost)
}
