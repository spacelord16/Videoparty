package db

import (
	"fmt"
	"log"
	"os"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"github.com/spacelord16/Videoparty/internal/model"
	"golang.org/x/crypto/bcrypt"
)

var DB *gorm.DB

func InitDB() error {
	if err := godotenv.Load(); err != nil {
		return fmt.Errorf("error loading .env file: %v", err)
	}

	dbHost := os.Getenv("DB_HOST")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbPort := os.Getenv("DB_PORT")

	if dbHost == "" {
		dbHost = "localhost"
	}
	if dbPort == "" {
		dbPort = "5432"
	}

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		dbHost, dbUser, dbPassword, dbName, dbPort)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %v", err)
	}

	// Auto migrate the schema
	err = db.AutoMigrate(&model.User{}, &model.Room{}, &model.RoomParticipant{})
	if err != nil {
		return fmt.Errorf("failed to migrate database: %v", err)
	}

	DB = db
	return nil
}

func CreateUser(db *gorm.DB, user model.User) error {
	log.Printf("CreateUser called with username=%s", user.Username)

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Error hashing password: %s", err)
		return err
	}
	log.Println("Password hashed successfully.")

	user.Password = string(hashedPassword)
	err = db.Create(&user).Error
	if err != nil {
		log.Printf("Error inserting new user into DB: %v", err)
		return err
	}

	log.Println("User inserted successfully.")
	return nil
}

func AuthenticateUser(db *gorm.DB, username, password string) (model.User, error) {
	var user model.User

	err := db.Where("username = ?", username).First(&user).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			log.Println("User not found.")
			return model.User{}, fmt.Errorf("user not found")
		} else {
			log.Printf("Error retrieving user: %s", err)
			return model.User{}, err
		}
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		log.Println("Authentication failed: invalid password.")
		return model.User{}, fmt.Errorf("invalid password")
	}

	log.Println("User authenticated successfully.")
	return user, nil
}
