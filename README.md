# SelfVPN
> A simple VPN client for creating and connecting DigitalOcean droplets

SelfVPN automatizes VPN server installation on DigitalOcean droplets. You can create and destroy droplets with this client. It will also run [this script](https://github.com/hwdsl2/setup-ipsec-vpn) to install VPN server on your droplet.

## Advantages of Using SelfVPN
 - You don't need to pay fixed monthly price for VPN. You will be paying hourly usage of droplet. For example if you destroy your droplet after 4 hours of daily usage, it will cost you 5$ * 4 / 24 = **0.84$** monthly (other taxes may apply).
 - SelfVPN is directly connected to DigitalOcean v2 API, there is no server owned by SelfVPN between you and your actual VPN server.
 - You are total control of your VPN server. You may create VPN servers on 8 different locations and destroy them as you wish.

## How To Use?
 - Build SelfVPN from source or [download a release](https://github.com/BekirUzun/SelfVPN/releases).
 - Get your API Key from here [DigitalOcean API Token](https://cloud.digitalocean.com/account/api/tokens)  
 - Open SelfVPN settings by clicking gearwheel button.
 - Set your API key and you are ready to go!
 
**Note:** A **one-time registry change** is required on Windows before connecting. Check [this link](https://github.com/hwdsl2/setup-ipsec-vpn/blob/master/docs/clients.md#windows-error-809).
 
If you don't know how to get you API token, you may check [this link](https://www.digitalocean.com/docs/api/create-personal-access-token/). If you don't have DigitalOcean account yet, you may sign-up with [this link](https://m.do.co/c/f769fd28e134) (my referral link) and get **50$ credit free**. 

## Running in Debug Mode 
To run SelfVPN with hot reload:

```
git clone https://github.com/BekirUzun/SelfVPN
cd SelfVPN
npm install
npm start
```

## Supported Platforms
 - Windows

Support for other platforms may be added by implementing connectivity features. 

## Troubleshooting
If you are having trouble connecting your server, you may check [setup-ipsec-vpn repo's troubleshooting section](https://github.com/hwdsl2/setup-ipsec-vpn/blob/master/docs/clients.md#troubleshooting). 

## Credits
- Angular-Electron: fast bootstrapping Angular and Electron - https://github.com/maximegris/angular-electron
- Nebular: UI library for Angular - https://github.com/akveo/nebular
- DigitalOceanVPNSetup: server and inspiration - https://github.com/carlfriess/DigitalOceanVPNSetup
