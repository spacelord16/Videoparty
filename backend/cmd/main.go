package main

import (
    "github.com/gin-gonic/gin"
    "github.com/spacelord16/Videoparty/internal/api"
    "github.com/spacelord16/Videoparty/internal/db"
    "github.com/spacelord16/Videoparty/internal/middleware"
    "github.com/joho/godotenv"
    "log"
)

func main() {
    if err := godotenv.Load(); err != nil {
        log.Println("No .env file found")
    }

    if err := db.InitDB(); err != nil {
        log.Fatal("Failed to connect to database:", err)
    }

    r := gin.Default()

    // CORS middleware
    r.Use(func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        c.Next()
    })

    // Public routes
    r.POST("/api/register", api.Register)
    r.POST("/api/login", api.Login)

    // Protected routes
    protected := r.Group("/api")
    protected.Use(middleware.AuthMiddleware())
    {
        // User routes
        protected.GET("/user", api.GetUser)
        protected.PUT("/user", api.UpdateUser)

        // Room routes
        protected.POST("/rooms", api.CreateRoom)
        protected.GET("/rooms/:code", api.GetRoom)
        protected.POST("/rooms/:code/join", api.JoinRoom)
        protected.PUT("/rooms/:code/state", api.UpdateRoomState)
    }

    r.Run(":8080")
} 