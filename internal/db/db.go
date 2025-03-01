package db

import (
    "database/sql"
    "fmt"
    "log"

    _ "github.com/lib/pq"
    "golang.org/x/crypto/bcrypt"
    "github.com/spacelord16/Videoparty/internal/model"
    "os"
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
        log.Fatalf("Error opening database: %s", err)
    }

    err = db.Ping()
    if err != nil {
        log.Fatalf("Error connecting to the database: %s", err)
    }

    log.Println("Successfully connected to the database.")
    return db, nil
}

func CreateUser(db *sql.DB, user model.User) error {
    // Hash the user's password
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
    if err != nil {
        return err
    }

    // Insert the new user into the database
    _, err = db.Exec("INSERT INTO users (username, password) VALUES ($1, $2)", user.Username, hashedPassword)
    if err != nil {
        return err
    }

    return nil
}

func AuthenticateUser(db *sql.DB, username, password string) (model.User, error) {
    var user model.User

    // Retrieve the user from the database
    err := db.QueryRow("SELECT id, username, password FROM users WHERE username = $1", username).Scan(&user.ID, &user.Username, &user.Password)
    if err != nil {
        return model.User{}, err
    }

    // Compare the provided password with the stored hash
    err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
    if err != nil {
        return model.User{}, err // Incorrect password
    }

    return user, nil
}