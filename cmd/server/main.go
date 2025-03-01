package main

import (
    "log"
    "net/http" // Import net/http to use http status codes
    "os"

    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
    "github.com/spacelord16/Videoparty/internal/api"
    "github.com/spacelord16/Videoparty/internal/db"
    "github.com/spacelord16/Videoparty/internal/model" // Ensure this is imported to use model.User
)

func main() {
    // Load environment variables
    err := godotenv.Load("/mnt/d/Videoparty/Videoparty/.env")
    if err != nil {
        log.Fatalf("Error loading .env file: %s", err)
    }

    // Initialize the router
    router := gin.Default()

    // Set up routes
    router.POST("/register", func(c *gin.Context) {
        dbConn, err := db.InitDB()
        if err != nil {
            log.Printf("DB connection error: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to database"})
            return
        }
        defer dbConn.Close()
    
        var user model.User
        if err := c.ShouldBindJSON(&user); err != nil {
            log.Printf("JSON binding error: %v", err)
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user data"})
            return
        }
    
        err = db.CreateUser(dbConn, user)
        if err != nil {
            log.Printf("CreateUser error: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Registration failed"})
            return
        }
    
        c.JSON(http.StatusOK, gin.H{"message": "User successfully registered"})
    })
    
    router.POST("/login", func(c *gin.Context) {
        dbConn, err := db.InitDB()  // Ensure a new connection for the login request
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to database"})
            return
        }
        defer dbConn.Close()
    
        api.LoginUser(c, dbConn)  // Pass dbConn correctly
    })
    log.Println("Starting server on port 8080...")

    // Start the server
    if err := router.Run(":8080"); err != nil {
        log.Fatal("Failed to run server:", err)
    }

    // Debugging print to ensure DB_HOST is loaded
    dbHost := os.Getenv("DB_HOST")
    log.Println("Database Host:", dbHost)
}
