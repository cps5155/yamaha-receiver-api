# API for Yamaha Receiver (RX-A730)
Stand up a REST service using [Express](https://expressjs.com/) and [NodeJS](https://nodejs.org/en/) (primarily) to interact with a Yamaha RX-A730 Home Theater Receiver.

Creates local webservice endpoints which process functions against the Yamaha Receiver. This can be used in conjunction with any front end client you may desire such as Google Home, Alexa, iOS shortcut, or write an app for your devices.

# Supports Common usage 
This is what will be wired up to Google Home Webhooks (eventually)
* _Volume Up_ by sending `POST` to `/receiver/turnItUp`
* _Volume Down_ by sending `POST` to `/receiver/turnItDown`
* _Power On_ by sending `POST` to `/receiver/powerOn`
* _Power Off_ by sending `POST` to `/receiver/powerOff`
* _Get Volume_ by sending `GET` to `/receiver/getVolume`
* _Get Power Status_ by sending `GET` to `/receiver/getPowerStatus`

# Examples
All assuming that the webservice is running 192.168.1.2:6969

* Get the current volume level

>Request: `curl http://192.168.1.1:6969/receiver/getVolume`
>Response: `Volume is: -350dB`

* Get the current power status

>Request: `curl http://192.168.1.1:6969/receiver/getPowerStatus`
>Response: `Power Status is: Standby`

* Increase the volume up by 15 DB (1.5 unit on receiver) 

>Request: `curl -X POST http://192.168.1.1:6969/receiver/turnItUp`
>Response: `Volume adjusted from -350 to -335 successfully.`

## Requires
* [nodejs](https://nodejs.org/en/download/package-manager/)
* [command-line-args](https://www.npmjs.com/package/command-line-args)
* [express](https://www.npmjs.com/package/express)
* [ip](https://www.npmjs.com/package/ip)
* [log4js](https://www.npmjs.com/package/log4js)
* [network-list](https://www.npmjs.com/package/network-list)
* [request](https://www.npmjs.com/package/request)
* [request-promise](https://www.npmjs.com/package/request-promise)
* [xml-js](https://www.npmjs.com/package/xml-js)
* http
* fs

# Setup
Clone this repo, install the dependencies from package.json, start the webServer.

    $ git clone https://github.com/cps5155/yamaha-receiver-api.git
    $ cd yamaha-receiver-api
    $ npm install --> this will install the required dependencies listed in package.json
    $ node ./lib/webServer.js -MAC=AA:BB:CC:DD:EE:FF --> start the webServer and provide it your receiver's MAC address

If you start the server on a network where the MAC address provided via CLI is not found, it will default to use `localhost:80` as the "target". When you are using localhost as your target, you should be running the `receiver-mockResponse.js` in the background so that the mock responses are sent back to the webServer as if the receiver was on the network. Future enhancement will start the `receiver-mockResponse.js` as a child process of the webserver when localhost is being used (so you don't have to remember to start/stop it manually to test).

Logs can be found in `./logs/` directory.

# TODO
* any security, whatsoever
* start mock webserver subprocess when localhost is being used
* add init.d example for auto daemon startup on Raspi

# Tested on 
* Raspi 1st gen (running Wheezy)
* Git bash on Windows
* Yamaha RX-A730 Home Theater Receiver
