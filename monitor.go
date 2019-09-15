package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/digitalocean/godo"
	"github.com/joho/godotenv"
	"golang.org/x/oauth2"
)

type TokenSource struct {
	AccessToken string
}

func (t *TokenSource) Token() (*oauth2.Token, error) {
	token := &oauth2.Token{
		AccessToken: t.AccessToken,
	}
	return token, nil
}

func main() {

	f, err := os.OpenFile("monitor.log", os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	if err != nil {
		log.Printf("error opening file: %v", err)
	}
	defer f.Close()

	err2 := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err2)
	}

	log.SetOutput(f)
	log.Println("-----------------------------------------------")
	log.Println("Starting network monitoring...")
	log.Printf("DO_PAT : %s", os.Getenv("DO_PAT"))

	tokenSource := &TokenSource{
		AccessToken: os.Getenv("DO_PAT"),
	}
	var vpnDroplet godo.Droplet
	oauthClient := oauth2.NewClient(context.Background(), tokenSource)
	client := godo.NewClient(oauthClient)
	ctx := context.TODO()
	listOpts := &godo.ListOptions{}
	droplets, resp, err := client.Droplets.List(ctx, listOpts)
	if len(droplets) > 0 {
		for _, droplet := range droplets {
			if droplet.Name == "SelfVPN" {
				log.Printf("Found vpn droplet with id: %d \n", droplet.ID)
				vpnDroplet = droplet
			}
		}
	} else {
		log.Fatalf("No droplet found? Wierd... response: %s \n", resp.Response)
	}

	if vpnDroplet.Name == "" || vpnDroplet.ID == 0 {
		log.Fatalf("SelfVPN droplet not found")
	}

	lastDownloaded := 0
	clientConnectionTimeout := 60
	noDownloadTimeout := 30

	for {
		time.Sleep(time.Second) // replace this with time.Minute
		outBytes, err := exec.Command("ifconfig").Output()
		if err != nil {
			log.Println(err)
		}
		if !isClientConnected(outBytes) {
			clientConnectionTimeout--
			if clientConnectionTimeout <= 0 {
				log.Println("There is no connected client")
				destroyDroplet(client, vpnDroplet)
				break
			}
			continue
		} else {
			clientConnectionTimeout = 20
		}

		downloaded := findDownloadedMB(outBytes)
		if downloaded-lastDownloaded < 10 {
			noDownloadTimeout--
			if noDownloadTimeout <= 0 {
				log.Println("There is no bandwith usage")
				destroyDroplet(client, vpnDroplet)
				break
			}
		} else {
			lastDownloaded = downloaded
			noDownloadTimeout = 30
		}
	}

}

func destroyDroplet(client *godo.Client, droplet godo.Droplet) {
	ip, _ := droplet.PublicIPv4()
	log.Printf("Destroying droplet with id %d on region %s with ip %s \n", droplet.ID, droplet.Region.Name, ip)
	// ctx := context.TODO()
	// resp, err := client.Droplets.Delete(ctx, droplet.ID)
	// log.Println(resp.Response)
	// if err != nil {
	// 	log.Println(err)
	// }
}

func isClientConnected(output []byte) bool {
	return regexp.MustCompile(`(?s)ppp[0-9]*:`).Match(output)
}

func findDownloadedMB(outBytes []byte) int {
	output := string(outBytes)
	ppp0 := regexp.MustCompile(`(?s)ppp[0-9]*:.*`).FindString(output)
	lines := strings.Split(ppp0, "\n")
	var numbers []string
	for _, line := range lines {
		fmt.Println(line)
		if strings.Contains(line, "TX") && strings.Contains(line, "bytes") {
			numbers = regexp.MustCompile(`[0-9]+`).FindAllString(line, 4)
		}
	}
	downloaded := numbers[1] // downloaded data in bytes
	if len(downloaded) < 7 {
		// less than 1mb, ignore
		return 0
	}
	downloaded = downloaded[0 : len(downloaded)-6]

	i, _ := strconv.ParseInt(downloaded, 0, 32)
	return int(i)
}
