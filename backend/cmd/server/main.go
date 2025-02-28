package main

import (
    "database/sql"
    "log"

    _ "github.com/lib/pq" // PostgreSQL driver

	"net/http"
    "github.com/gin-gonic/gin"
    "github.com/spacelord16/Videoparty/internal/db" 
	"github.com/spacelord16/Videoparty/internal/middleware"
	"github.com/spacelord16/Videoparty/internal/api"

)

func main() {
    router := gin.Default()
    router.Use(middleware.Logger())

    router.GET("/", func(c *gin.Context) {
        c.String(http.StatusOK, "Welcome to the Video Streaming Platform")
    })

    // Open a database connection
    db, err := sql.Open("postgres", "user=postgres dbname=example sslmode=disable")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    // Example query
    var name string
    err = db.QueryRow("SELECT name FROM users WHERE id = $1", 1).Scan(&name)
    if err != nil {
        log.Fatal(err)
    }
    log.Println(name)

    // Initialize the database
    database := db.InitDB()
    defer database.Close()

    // User routes
    router.POST("/register", api.RegisterUser)
    router.POST("/login", api.LoginUser)

    router.Run(":8080")
}