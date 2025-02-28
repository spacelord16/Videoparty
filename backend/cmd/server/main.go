package main

import (
	"fmt"
	"net/http"
	"github.com/gin-gonic/gin"
)

func main(){
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request){
		fmt.Fprintf(w, "Hello, you have reached %s", r.URL.Path)
	})

	fmt.Println("Server is running on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}

// package main

// import (
// 	"net/http"
//     "github.com/gin-gonic/gin"
// )

// func main() {
//     // Create a Gin router using Default, which includes logging and recovery middleware
//     router := gin.Default()

//     // Define a simple GET route
//     router.GET("/", func(c *gin.Context) {
//         c.String(http.StatusOK, "Hello, you have reached %s", c.Request.URL.Path)
//     })

//     // Start the server on port 8080
//     router.Run(":8080") // This listens and serves on http://localhost:8080
// }

