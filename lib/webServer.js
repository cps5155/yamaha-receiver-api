/*
	hosts REST APIs for Yamaha Receiver API
*/

var http = require('http');
var request = require('request-promise');
var express = require('express');
var log4js = require('log4js');
var ip = require('ip');
var receiver = require('./yamaha-receiver.js');
const port=6969;
const deltaVolumeChange=15;

log4js.configure(
  {
    appenders: {
      dateFile: {
        type: 'dateFile',
        filename: '../logs/web-service.log',
        pattern: 'yyyy-MM-dd-hh',
        compress: true
      },
      out: {
        type: 'stdout'
      }
    },
    categories: {
      default: { appenders: ['dateFile', 'out'], level: 'trace' }
    }
  }
);

const logger = log4js.getLogger('webServer');
var app = express();
if(process.argv.length>2){
	receiver.init(process.argv[3]);
} else {
	// default
	receiver.initDefault();
}


function getPaths(){
	var paths = '';
	app._router.stack.forEach(function(r){
		if(r.route && r.route.path){
			var methods = [];
			for (var method in r.route.methods){
				if (method == 'all') {methods.push('ALL');}
			    methods.push(method.toUpperCase())
			}
			paths+=methods+'\t'+r.route.path+'\n';
		}
	});
	return paths;
};

// endpoints
app.get('/receiver/getBasicInfo', async function(req,res){
	var retVal = '';
	var status = 200;

	try{
		basicInfoResponse = await receiver.getBasicInfo();
		if(basicInfoResponse.status == 200){
			retVal = "Success!\n"+basicInfoResponse.responseBody;
		}
	} catch(err) {
		retVal = "There was an error:\n\t"+err.msg;
		logger.error(retVal);
		status=500;
	}
	
	res.status(status).type('text/plain').send(retVal);
});

app.get('/receiver/getVolume', async function(req,res){
	var retVal = '';
	var status = 200;

	try{
		volumeResponse = await receiver.getVolume();
		if(volumeResponse.status == 200){
			retVal = "Volume is: "+volumeResponse.volumeObj.volume+volumeResponse.volumeObj.units;
		}
	} catch(err) {
		retVal = "There was an error:\n\t"+err.msg;
		logger.error(retVal);
		status=500;
	}
	
	res.status(status).type('text/plain').send(retVal);
});

app.get('/receiver/turnItUp',function(req,res){
	res.status(400).type('text/plain').send("Send a POST request, not a GET for this request");
});

app.post('/receiver/turnItUp', async function(req,res){
	var retVal = '';
	var status = 200;
	try{
		var changeVolResp = await receiver.changeVolume(parseInt(Math.abs(deltaVolumeChange)));
		status = changeVolResp.status;
		retVal = changeVolResp.msg;
	} catch(err) {
		retVal = "There was an error:\n\t"+err.msg;
		logger.error(retVal);
		status=500;
	}
	
	res.status(status).type('text/plain').send(retVal);
});

app.get('/receiver/turnItDown', function(req,res){
	res.status(400).type('text/plain').send("Send a POST request, not a GET for this request");
});

app.post('/receiver/turnItDown', async function(req,res){
	var retVal = '';
	var status = 200;
	try{
		var changeVolResp = await receiver.changeVolume(parseInt(-Math.abs(deltaVolumeChange)));
		status = changeVolResp.status;
		retVal = changeVolResp.msg;
	} catch(err) {
		retVal = "There was an error:\n\t"+err.msg;
		logger.error(retVal);
		status=500;
	}
	
	res.status(status).type('text/plain').send(retVal);
});

app.get('/receiver/getPowerStatus', async function(req,res){
	var retVal = '';
	var status = 200;

	try{
		powerResponse = await receiver.getPowerStatus();
		if(powerResponse.status == 200){
			retVal = "Power Status is: "+powerResponse.powerObj.power;
		}
	} catch(err) {
		retVal = "There was an error:\n\t"+err.msg;
		logger.error(retVal);
		status=500;
	}
	
	res.status(status).type('text/plain').send(retVal);
});

app.get('/receiver/powerOn', function(req,res){
	res.status(400).type('text/plain').send("Send a POST request, not a GET for this request");
});

app.post('/receiver/powerOn', async function(req,res){
	var retVal = '';
	var status = 200;
	try{
		var turnPowerOnResp = await receiver.setPowerState('ON');
		status = turnPowerOnResp.status;
		retVal = turnPowerOnResp.msg;
	} catch(err) {
		retVal = "There was an error:\n\t"+err.msg;
		logger.error(retVal);
		status=500;
	}
	
	res.status(status).type('text/plain').send(retVal);
});

app.get('/receiver/powerOff', function(req,res){
	res.status(400).type('text/plain').send("Send a POST request, not a GET for this request");
});

app.post('/receiver/powerOff', async function(req,res){
	var retVal = '';
	var status = 200;
	try{
		var turnPowerOffResp = await receiver.setPowerState('OFF');
		status = turnPowerOffResp.status;
		retVal = turnPowerOffResp.msg;
	} catch(err) {
		retVal = "There was an error:\n\t"+err.msg;
		logger.error(retVal);
		status=500;
	}
	
	res.status(status).type('text/plain').send(retVal);
});

app.get('/help', function(req,res){
	res.status(200).type("text/plain").send("Paths Available\n\n"+getPaths());
});

app.all('*', function(req,res){
	res.status(200).type("text/plain").send("Paths Available\n\n"+getPaths());
});


app.listen(port);
logger.info("webServer listening on: "+ip.address()+":"+port);