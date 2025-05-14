package api

import (
    "github.com/gin-gonic/gin"
    "github.com/spacelord16/Videoparty/internal/model"
    "github.com/spacelord16/Videoparty/internal/db"
    "net/http"
    "math/rand"
    "time"
)

func generateRoomCode() string {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    const length = 6
    b := make([]byte, length)
    for i := range b {
        b[i] = charset[rand.Intn(len(charset))]
    }
    return string(b)
}

func CreateRoom(c *gin.Context) {
    var room model.Room
    if err := c.ShouldBindJSON(&room); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Get user ID from context (set by auth middleware)
    userID, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    room.HostID = userID.(uint)
    room.Code = generateRoomCode()
    room.CreatedAt = time.Now()
    room.UpdatedAt = time.Now()

    if err := db.DB.Create(&room).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create room"})
        return
    }

    c.JSON(http.StatusCreated, room)
}

func JoinRoom(c *gin.Context) {
    code := c.Param("code")
    var room model.Room
    if err := db.DB.Where("code = ?", code).First(&room).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
        return
    }

    userID, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    participant := model.RoomParticipant{
        RoomID:   room.ID,
        UserID:   userID.(uint),
        JoinedAt: time.Now(),
    }

    if err := db.DB.Create(&participant).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to join room"})
        return
    }

    c.JSON(http.StatusOK, room)
}

func GetRoom(c *gin.Context) {
    code := c.Param("code")
    var room model.Room
    if err := db.DB.Where("code = ?", code).First(&room).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
        return
    }

    c.JSON(http.StatusOK, room)
}

func UpdateRoomState(c *gin.Context) {
    code := c.Param("code")
    var room model.Room
    if err := db.DB.Where("code = ?", code).First(&room).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
        return
    }

    userID, exists := c.Get("userID")
    if !exists || userID.(uint) != room.HostID {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Only room host can update state"})
        return
    }

    var updateData struct {
        IsPlaying   bool    `json:"is_playing"`
        CurrentTime float64 `json:"current_time"`
    }

    if err := c.ShouldBindJSON(&updateData); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    room.IsPlaying = updateData.IsPlaying
    room.CurrentTime = updateData.CurrentTime
    room.UpdatedAt = time.Now()

    if err := db.DB.Save(&room).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update room"})
        return
    }

    c.JSON(http.StatusOK, room)
} 