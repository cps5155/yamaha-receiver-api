/*
	Sends requests to the Yamaha receiver
	Services exposed are used in webServer.js
*/

var request = require('request-promise');
var formatter = require('xml-js');
var log4js = require('log4js');
var util = require('util');
var receiver = require('./yamaha-receiver.js');
var scanner = require('network-list');

// setup

// properties of a receiver
const getBasicStatusRequestBody='<YAMAHA_AV cmd="GET"><Main_Zone><Basic_Status>GetParam</Basic_Status></Main_Zone></YAMAHA_AV>';
const defaultReceiverMAC = '00:a0:de:9f:a4:25';
const localhost = "http://localhost"
const yamahaAPIURI = '/YamahaRemoteControl/ctrl';
const debugBasicStatusURI = '/mockService/getBasicStatus';
const debugreceiverVolumeURI = '/mockService/setVolume';
const debugReceiverPowerURI = '';
const logger = log4js.getLogger('receiver');
const powerOffState = 'Standby';
const powerOnState = 'On';
// setup for localhost/debugging to begin with
var receiverStatusURI = debugBasicStatusURI;
var receiverVolumeURI = debugreceiverVolumeURI;
var receiverAddress = localhost;
var receiverPowerURI = debugReceiverPowerURI;


function createSetVolumeRequestBody(volumeValue){
	return ('<YAMAHA_AV cmd="PUT"><Main_Zone><Volume><Lvl><Val>'+volumeValue+'</Val><Exp>1</Exp><Unit>dB</Unit></Lvl></Volume></Main_Zone></YAMAHA_AV>');
}

function createPowerChangeRequestBody(state){
	return ('<YAMAHA_AV cmd="PUT"><System><Power_Control><Power>'+state+'</Power></Power_Control></System></YAMAHA_AV>');
}

exports.initDefault = async function(){
	logger.debug("no MAC provided on CLI initialization, searching for default Receiver MAC: "+defaultReceiverMAC);
	var init = await receiver.init(defaultReceiverMAC);
}
exports.init = async function(providedMAC){
	var retVal={status:303,msg:"defaulting to localhost, assuming you're debugging"};
	var rationalizedMAC='';
	rationalizedMAC = providedMAC.replace(/-/gi,':');

	scanner.scan({max:50, vendor:false,timeout:1}, (err, arr) => {
		for(var ipAddr of arr){
			if(ipAddr.mac == rationalizedMAC){
				// set legit values for the host
				receiverAddress = "http://"+ipAddr.ip;
				// update the API URIs to the legit values
				receiverStatusURI = yamahaAPIURI;
				receiverVolumeURI = yamahaAPIURI;
				receiverPowerURI = yamahaAPIURI;
				logger.info("Found IP ("+ipAddr.ip+") with MAC: "+rationalizedMAC);
				retVal = {status:200, msg: "OK"};
				break;
			};
		};
	});
};


exports.getVolume = async function(){
	return new Promise(async function(resolve, reject){
		try{
			var basicInfo = await receiver.getBasicInfo();
			if(basicInfo.status == 200){
				var basicInfoJSON = JSON.parse(formatter.xml2json(basicInfo.responseBody,{compact:true}));
				
				var volumeObj = {
					volume : basicInfoJSON.YAMAHA_AV.Main_Zone.Basic_Status.Volume.Lvl.Val._text,
					units : basicInfoJSON.YAMAHA_AV.Main_Zone.Basic_Status.Volume.Lvl.Unit._text
				};
				logger.debug("Got volume OK")
				resolve({status:200,msg:"OK",volumeObj});
			} else {
				var retVal = "getBasicInfo status code not OK: "+basicInfo.status;
				logger.error(retVal);
				reject({status:500,msg:retVal})
			}

		}catch(err){
			var errMsg = "Error - receiver.getVolume():: "+err;
			logger.error(errMsg);
			reject({status:500,msg:errMsg});
		}		
	});	
};

exports.getBasicInfo = async function(){
	return new Promise(function(resolve, reject){			
		try{
			request({
				"method":"POST",
				"uri":receiverAddress+receiverStatusURI,
				"headers":"{'Content-Type':'text/xml'}",
				"body":getBasicStatusRequestBody
			}).then(function(responseBody){
				logger.debug("Got basic Info OK");
				resolve({status:200,msg:"OK",responseBody});
			}).catch(function(err){
				var retVal="getBasicInfo failure with error: "+err;
				logger.error(retVal);
				reject({status:500,msg:retVal});
			});
		} catch(err) {
			var msg = "Error - receiver.getBasicInfo: "+err;
			logger.error(msg);
			reject(msg);
		}
	});
};

exports.setVolume = async function(newVol){
	return new Promise(function(resolve, reject){
		var volumeBody = createSetVolumeRequestBody(newVol);
		try{
			request({
				"method" : "POST",
				"uri" : receiverAddress+receiverVolumeURI,
				"headers" : "{'Content-Type':'text/xml'}",
				"body" : volumeBody
			}).then(function(responseBody){
				logger.debug("set volume successully to value : "+newVol);
				resolve({status:200,msg:"OK"});
			}).catch(function(err){
				var retVal="setVolume response not OK: "+err;
				logger.error(retVal);
				reject({status:500,msg:retVal});
			});
		} catch(err) {
			var errMsg = "Error - receiver.setVolume: "+err;
			logger.error(errMsg);
			reject({status:500,msg: errMsg});
		}
	});
};

exports.changeVolume = async function(changeVol){
	return new Promise(async function(resolve,reject){
		try{
			var retVal='';
			var currentVol = await receiver.getVolume();
			var newVol = parseInt(currentVol.volumeObj.volume)+parseInt(changeVol);
			var setVolResponse = await receiver.setVolume(newVol);
			if(setVolResponse.status == 200){
				retVal = "Volume adjusted from "+currentVol.volumeObj.volume+" to "+newVol+" successfully.";
				logger.debug(retVal);
				resolve({status:200,msg:retVal});
			} else {
				retVal = "Volume adjusment error with status: "+setVolResponse.status+"\nand message:"+setVolResponse.msg;
				logger.error(retval);
				reject({status:500,msg:retVal});
			}
		} catch(err){
			var errMsg = "Error - receiver.changeVolume: "+err;
			logger.error(errMsg);
			reject({status:500,msg: errMsg});
		}
	});
};

exports.setPowerState = async function(desiredPowerState){
	return new Promise(async function(resolve, reject){
		try{
			var retVal='';
			var powerBody = '';
			if(desiredPowerState === 'OFF'){
				powerBody = createPowerChangeRequestBody(powerOffState);
			} else {
				powerBody = createPowerChangeRequestBody(powerOnState);
			}
			request({
				"method" : "POST",
				"uri" : receiverAddress+receiverPowerURI,
				"headers" : "{'Content-Type':'text/xml'}",
				"body" : powerBody
			}).then(function(responseBody){
				logger.debug("Power successfully changed  to value : "+desiredPowerState);
				resolve({status:200,msg:"OK"});
			}).catch(function(err){
				var retVal="Power change response not OK: "+err;
				logger.error(retVal);
				reject({status:500,msg:retVal});
			});

		} catch(err) {
			var errMsg = "Error - receiver.setPowerState: "+err;
			logger.error(errMsg);
			reject({status:500,msg: errMsg});
		}
	});
}