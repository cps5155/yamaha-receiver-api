/*
	Mocks the Yamaha AV Receiver responses for testing while away from home
*/

var express = require('express');
var log4js = require('log4js');
const path = require('path');
var fs = require('fs');

var app = express();

const port = 80;

log4js.configure(
  {
    appenders: {
      dateFile: {
        type: 'dateFile',
        filename: path.join(__dirname,'../logs//mockResponse.log',
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

const logger = log4js.getLogger('logger');

var sleep = function(sleepTime){
	return new Promise(function(resolve, reject){
		setTimeout(function(){
			logger.info('Sleeping for time: '+sleepTime);
			resolve('');
		},sleepTime);
	});
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

app.post('/mockService/getBasicStatus', async function(req,res){
	var retVal = fs.readFileSync('../resources/basicStatusResponse.xml','utf8');
	logger.debug('calling service retrieval');
	var wait = await sleep(500);
	logger.debug('finished service retrieval');
	res.status(200).type('text/xml').send(retVal);
});

app.post('/mockService/setVolume', async function(req,res){
	var retVal = fs.readFileSync('../resources/changeVolumeResponse.xml','utf8');;
	logger.debug('calling sleep');
	var wait = await sleep(750);
	logger.debug('finished sleeping');
	res.status(200).type('text/xml').send(retVal);
});

app.post('/mockService/setPowerState', async function(req,res){
	var retVal = fs.readFileSync('../resources/changePowerResponse.xml','utf8');
	logger.debug('calling sleep');
	var wait = await sleep(750);
	logger.debug('finished sleeping');
	res.status(200).type('text/xml').send(retVal);
});

app.get('/help', function(req,res){
	res.status(200).type("text/plain").send("Paths Available\n\n"+getPaths());
});

app.all('*', function(req,res){
	res.status(200).type("text/plain").send("Paths Available\n\n"+getPaths());
});


app.listen(port);
logger.info("mockResponse Server running on port: "+port);
