package model

import "time"

type Room struct {
    ID          uint      `json:"id" gorm:"primaryKey"`
    Name        string    `json:"name"`
    Code        string    `json:"code" gorm:"unique"`
    HostID      uint      `json:"host_id"`
    Host        User      `json:"host" gorm:"foreignKey:HostID"`
    VideoURL    string    `json:"video_url"`
    IsPlaying   bool      `json:"is_playing"`
    CurrentTime float64   `json:"current_time"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}

type RoomParticipant struct {
    ID        uint      `json:"id" gorm:"primaryKey"`
    RoomID    uint      `json:"room_id"`
    UserID    uint      `json:"user_id"`
    User      User      `json:"user" gorm:"foreignKey:UserID"`
    JoinedAt  time.Time `json:"joined_at"`
} 