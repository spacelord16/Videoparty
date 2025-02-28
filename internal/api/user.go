package api

import (
	"net/http"
	"github.com/gin-gonic/gin"
    "github.com/spacelord16/Videoparty/internal/model"
)

func RegisterUser(c *gin.Context) {
	var newUser model.User
	if err := c.ShouldBindBodyWithJSON(&newUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Registration successful", "user": newUser})
}

func LoginUser(c *gin.Context) {
	var loginUser model.User
	if err := c.ShouldBindJSON(&loginUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Login successful", "user": loginUser})
}