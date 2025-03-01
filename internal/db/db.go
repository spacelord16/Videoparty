package db

import (
	"database/sql"
	"fmt"
	"log"

	"os"

	_ "github.com/lib/pq"
	"github.com/spacelord16/Videoparty/internal/model"
	"golang.org/x/crypto/bcrypt"
    
)

func InitDB() (*sql.DB, error) {
    host := os.Getenv("DB_HOST")
    port := os.Getenv("DB_PORT")
    user := os.Getenv("DB_USER")
    password := os.Getenv("DB_PASSWORD")
    dbname := os.Getenv("DB_NAME")

    connectionString := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
        host, port, user, password, dbname)
    db, err := sql.Open("postgres", connectionString)
    if err != nil {
        log.Printf("Error opening database: %s", err)
        return nil, err
    }

    err = db.Ping()
    if err != nil {
        log.Printf("Error connecting to the database: %s", err)
        return nil, err
    }

    log.Println("Successfully connected to the database.")
    return db, nil
}

func CreateUser(db *sql.DB, user model.User) error {
    log.Printf("CreateUser called with username=%s", user.Username)
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
    if err != nil {
        log.Printf("Error hashing password: %v", err)
        return err
    }
    log.Println("Hashed password created")

    _, err = db.Exec("INSERT INTO users (username, password) VALUES ($1, $2)", user.Username, hashedPassword)
    if err != nil {
        log.Printf("Error inserting new user: %v", err)
        return err
    }

    log.Println("User inserted successfully")
    return nil
}



func AuthenticateUser(db *sql.DB, username, password string) (model.User, error) {
    var user model.User

    err := db.QueryRow("SELECT id, username, password FROM users WHERE username = $1", username).Scan(&user.ID, &user.Username, &user.Password)
    if err != nil {
        if err == sql.ErrNoRows {
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
