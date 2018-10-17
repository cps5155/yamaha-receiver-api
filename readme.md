# API for Yamaha Receiver (RX-A730)
Stand up a REST service using [Express](https://expressjs.com/) and [NodeJS](https://nodejs.org/en/) (primarily) to interact with a Yamaha RX-A730 Home Theater Receiver.

Creates local webservie endpoints which process functions agains the Yamaha Receiver. This can be used in conjunction with any front end client you may desire such as Google Home (via IFTT webhooks), Alexa, iOS shortcut, or write an app for your devices.

## Requires
* [nodejs](https://nodejs.org/en/download/package-manager/)
* [express](https://www.npmjs.com/package/express)
* [request](https://www.npmjs.com/package/request)
* [request-promise](https://www.npmjs.com/package/request-promise)
* [log4js](https://www.npmjs.com/package/log4js)
* [xml-js](https://www.npmjs.com/package/xml-js)
* [network-list](https://www.npmjs.com/package/network-list)
* http
* fs

# Setup
Clone this repo, install the dependencies from package.json, start the webServer.

    $ git clone {this repo}
    $ cd yamaha-receiver-api
    $ npm install --> this will install the required dependencies listed in package.json (see TODO for now)
    $ node ./lib/webServer.js -MAC=AA:BB:CC:DD:EE:FF --> start the webServer and provide it your receiver's MAC address

If you start the server on a network where the MAC address provided via CLI is not found, it will default to use `localhost:80` as the "target". When you are using localhost as your target, you should be running the `receiver-mockResponse.js` in the background so that the mock responses are sent back to the webServer as if the receiver was on the network. Future enhancement will start the `receiver-mockResponse.js` as a child process of the webserver when localhost is being used (so you don't have to remember to start/stop it manually to test).

Logs can be found in `./logs/` directory.

# Supports Common usage 
This is what will be wired up to Google Home Webhooks (eventually)
* _Volume Up_ by sending `POST` to `/receiver/turnItUp`
* _Volume Down_ by sending `POST` to `/receiver/turnItDown`
* _Power On_ by sending `POST` to `/receiver/powerOn`
* _Power Off_ by sending `POST` to `/receiver/powerOff`
* _Get Volume_ by sending `GET` to `/receiver/getVolume`

# TODO
* any security, whatsoever
* create package.json
* use commmand-line-args to parse MAC from CLI like `-MAC=AA:BB:CC:DD:EE:FF`
* start mock webserver subprocess when localhost is being used
* add example curl commands to the `/examples`/ dir

# Tested on 
Raspi 1st gen (running Wheezy)
Git bash on Windows
