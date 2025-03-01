package api

import (
    "database/sql"
    "net/http"
    "github.com/gin-gonic/gin"
    "github.com/spacelord16/Videoparty/internal/model"
    "github.com/spacelord16/Videoparty/internal/db"
)

func RegisterUser(c *gin.Context, db *sql.DB) {
    var newUser model.User
    if err := c.ShouldBindJSON(&newUser); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    if err := db.CreateUser(db, newUser); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Registration failed"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Registration successful", "user": newUser})
}

func LoginUser(c *gin.Context, db *sql.DB) {
    var loginUser model.User
    if err := c.ShouldBindJSON(&loginUser); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    user, err := db.AuthenticateUser(db, loginUser.Username, loginUser.Password)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Login failed"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Login successful", "user": user})
}









// package api

// import (
//     "database/sql"
//     // "log"

//     _ "github.com/lib/pq" // PostgreSQL driver

//     "net/http"

//     "github.com/gin-gonic/gin"
//     "github.com/spacelord16/Videoparty/internal/model"
//     "github.com/spacelord16/Videoparty/internal/db"
// )

// // Assuming you have some helper functions to interact with your database
// // such as db.CreateUser(newUser) which handles the SQL INSERT operation.

// func RegisterUser(c *gin.Context) {
//     var newUser model.User
//     if err := c.ShouldBindJSON(&newUser); err != nil {
//         c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
//         return
//     }

//     // Here you would typically add logic to save the user to the database
//     if err := db.CreateUser(database, newUser); err != nil {
//         c.JSON(http.StatusInternalServerError, gin.H{"error": "Registration failed"})
//         return
//     }

//     c.JSON(http.StatusOK, gin.H{"message": "Registration successful", "user": newUser})
// }

// func LoginUser(c *gin.Context) {
//     var loginUser model.User
//     if err := c.ShouldBindJSON(&loginUser); err != nil {
//         c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
//         return
//     }

//     // Authentication logic would go here
//     user, err := db.AuthenticateUser(database, loginUser.Username, loginUser.Password)
//     if err != nil {
//         c.JSON(http.StatusInternalServerError, gin.H{"error": "Login failed"})
//         return
//     }

//     c.JSON(http.StatusOK, gin.H{"message": "Login successful", "user": user})
// }
