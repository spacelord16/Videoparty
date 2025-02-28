package db

import (
    "database/sql"
    "fmt"
    "log"

    _ "github.com/lib/pq"
)

const (
    host     = "localhost"
    port     = 5432          
    user     = "spacelord"
    password = "fastrack2025"
    dbname   = "videoparty"
)

// InitDB initializes and returns a database object
func InitDB() *sql.DB {
    // Construct the data source name
    psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
        host, port, user, password, dbname)

    // Open a connection to the database
    db, err := sql.Open("postgres", psqlInfo)
    if err != nil {
        log.Fatalf("Error opening database: %s", err)
    }

    // Verify the connection with a ping
    err = db.Ping()
    if err != nil {
        log.Fatalf("Error connecting to the database: %s", err)
    }

    log.Println("Successfully connected to the database.")
    return db
}
