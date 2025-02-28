package main

import (
	"net/http"
    "github.com/gin-gonic/gin"
	"github.com/spacelord16/Videoparty/internal/middleware"
	"github.com/spacelord16/Videoparty/internal/api"
)

func main() {
    router := gin.Default()
    router.Use(middleware.Logger())

    router.GET("/", func(c *gin.Context) {
        c.String(http.StatusOK, "Welcome to the Video Streaming Platform")
    })

    // User routes
    router.POST("/register", api.RegisterUser)
    router.POST("/login", api.LoginUser)

    router.Run(":8080")
}