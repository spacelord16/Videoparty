package db

import (
    "database/sql"
    // "fmt"
    "log"

    _ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
	"github.com/spacelord16/Videoparty/internal/model"
)

const (
    host     = "localhost"
    port     = 5432          // Default port
    user     = "spacelord"
    password = "fastrack2025"
    dbname   = "videoparty"
)

// InitDB initializes and returns a database object

func InitDB() *sql.DB {
    connectionString := "user=username dbname=password sslmode=disable"
    db, err := sql.Open("postgres", connectionString)
    if err != nil {
        log.Fatal(err)
    }

    err = db.Ping()
    if err != nil {
        log.Fatal(err)
    }

    return db
}

func CreateUser(db *sql.DB, user model.User) error {
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
    if err != nil {
        return err
    }
    _, err = db.Exec("INSERT INTO users (username, password) VALUES ($1, $2)", user.Username, hashedPassword)
    return err
}

func AuthenticateUser(db *sql.DB, username, password string) (model.User, error) {
    var user model.User
    err := db.QueryRow("SELECT id, username, password FROM users WHERE username = $1", username).Scan(&user.ID, &user.Username, &user.Password)
    if err != nil {
        return model.User{}, err
    }

    err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
    if err != nil {
        return model.User{}, err // Invalid credentials
    }

    return user, nil
}


// package db

// import (
//     "database/sql"
//     "fmt"
//     "log"

//     _ "github.com/lib/pq" // PostgreSQL driver
// )

// // Database configuration constants
// const (
//     host     = "localhost"
//     port     = 5432
//     user     = "your_username"
//     password = "your_password"
//     dbname   = "videoparty"
// )

// // InitDB initializes and returns a database object
// func InitDB() *sql.DB {
//     // Construct the data source name
//     psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
//         host, port, user, password, dbname)

//     // Open a connection to the database
//     db, err := sql.Open("postgres", psqlInfo)
//     if err != nil {
//         log.Fatalf("Error opening database: %s", err)
//     }

//     // Verify the connection with a ping
//     err = db.Ping()
//     if err != nil {
//         log.Fatalf("Error connecting to the database: %s", err)
//     }

//     log.Println("Successfully connected to the database.")
//     return db
// }
