# API for Yamaha Receiver (RX-A730)
Stand up a REST service using [Express](https://expressjs.com/) and [NodeJS](https://nodejs.org/en/) (primarily) to interact with a Yamaha RX-A730 Home Theatre Receiver.

Allows for a local web curl request to process functions against the receiver
i.e. GET a local webservice to get the current volume of the reciever
i.e. POST a local webservice to change the volume of the receiver

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
Install the required pacakges via npm
Place all the required files in the same folder on the server

## If testing locally on a network without the Yamaha receiver, start the mockResponse server
    node receiver-mockresponse.js&
## Start the webServices
    node webServer

# Usage
Starting the webServer will init the yamaha-receiver object. This will attempt to find the MAC address specified  in `yamaha-receiver.js` variable `receiverMAC`(so specify this to your Receiver's MAC). This will take about 10 seconds, so your requests to the service before that is finished will fail. If you are testing on a network without the receiver, it will default to localhost if it can't find the specified MAC.

Logs can be found in `./logs/` directory.

# Supports Common usage (this is what will be wired up to Google Home Webhooks)
`Volume Up` by sending `POST` to `/receiver/turnItUp`
`Volume Down` by sending `POST` to `/receiver/turnItDown`
`Power On` by sending `POST` to `/receiver/powerOn`
`Power Off` by sending `POST` to `/receiver/powerOff`
`Get Volume` by sending `GET` to `/receiver/getVolume`

#TODO
* any security, whatsoever
* create package.json
* use commmand-line-args