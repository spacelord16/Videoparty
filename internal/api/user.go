package api

import (
    "database/sql"
    "net/http"

    "github.com/gin-gonic/gin"
    "github.com/spacelord16/Videoparty/internal/model"
    "github.com/spacelord16/Videoparty/internal/db"
)

func RegisterUser(c *gin.Context, database *sql.DB) {
    var newUser model.User
    if err := c.ShouldBindJSON(&newUser); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Correcting function call
    if err := db.CreateUser(database, newUser); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Registration failed"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Registration successful", "user": newUser})
}

func LoginUser(c *gin.Context, database *sql.DB) {
    var loginUser model.User
    if err := c.ShouldBindJSON(&loginUser); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Correcting function call
    user, err := db.AuthenticateUser(database, loginUser.Username, loginUser.Password)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Login failed"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Login successful", "user": user})
}
