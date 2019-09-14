package main

import (
	"io"
	"log"
	"net/http"

	"github.com/rs/cors"
)

func handler(w http.ResponseWriter, req *http.Request) {
	w.Header().Add("content-type", "application/json")
	io.WriteString(w, "{\"success\":true}")
}

func main() {

	mux := http.NewServeMux()
	mux.HandleFunc("/", handler)

	// Support CORS:
	corsHandler := cors.Default().Handler(mux)

	log.Fatal(http.ListenAndServe(":80", corsHandler))

}
