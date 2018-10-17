'use strict';

var async = require('async');
var ping = require('ping');
var arp = require('node-arp');
var dns = require('dns');
var request = require('request');
var ip = require('ip');

var options = {
    // ip: '192.168.1',
    timeout: 15,
    vendor: true,
    min: 1,
    max: 255
};

function getInfo(ip, callback) {
    var result = {
        ip: ip,
        alive: false,
        hostname: null,
        mac: null,
        vendor: null,
        hostnameError: null,
        macError: null,
        vendorError: null
    };
    // console.log(`Checking ${ip}...`);
    ping.promise.probe(ip, {
        timeout: options.timeout
    }).then(function (res) {
        if (res.alive) {
            result.alive = true;
            dns.reverse(ip, function (err, host) {
                if (err) {
                    result.hostnameError = 'Error on get hostname';
                } else {
                    result.hostname = host && host.length ? host[0] : null;
                }
                arp.getMAC(ip, function (err2, mac) {
                    if (err2 || !mac) {
                        result.macError = 'Error on get Mac address';
                    } else {
                        result.mac = mac.replace(/:([^:]{1}):/g, ':0$1:');
                    }
                    if (options.vendor && mac) {
                        request.get('https://macvendors.co/api/' + mac.replace(/:([^:]{1}):/g, ':0$1:') + '/json', function (err3, httpRes, body) {
                            // console.log(httpRes.statusCode, body);
                            if (err3 || httpRes.statusCode !== 200) {
                                // console.log(`Error on get vendor... ip: ${ip} : Mac: ${mac}`);
                                result.vendorError = 'Error on get vendor';
                                callback(null, result);
                            } else {
                                var cont = JSON.parse(body);
                                if (cont && cont.result && cont.result.company) {
                                    result.vendor = cont.result.company;
                                    callback(null, result);
                                } else {
                                    result.vendorError = 'Vendor has no result';
                                    callback(null, result);
                                }
                            }
                        });
                    } else {
                        callback(null, result);
                    }
                });
            });
        } else {
            callback(null, result);
        }
    });
}

// Keep this function to use in a future version to port scan
function checkPort(port, host, callback) {
    var socket = new Socket(),
        status = null;
    socket.on('connect', function () {
        status = 'open';
        socket.end();
    });
    socket.setTimeout(1500);
    socket.on('timeout', function () {
        status = 'closed';
        socket.destroy();
    });
    socket.on('error', function (exception) {
        status = 'closed';
    });
    socket.on('close', function (exception) {
        callback(null, status, host, port);
    });
    socket.connect(port, host);
}

function getBaseIp(opts) {
    if (!('ip' in opts)) {
        var ipAddress = ip.address();
        if (ipAddress) {
            var aIp = ipAddress.split('.');
            if (aIp.length === 4) {
                opts.ip = aIp.slice(0, -1).join('.');
                return opts;
            }
        }
    } else {
        var _aIp = opts.ip.split('.');
        if (_aIp.length === 3) {
            return opts;
        } else {
            throw new Error('IP should be xxx.xxx.xxx');
            return;
        }
    }
    throw new Error('No IP address');
}

module.exports = {
    scanEach: function scanEach(opts, callback) {
        // console.log(opts);
        var finalOpts = getBaseIp(opts);
        Object.assign(options, finalOpts);
        // console.log(options);
        for (var i = options.min; i < options.max; i++) {
            getInfo(options.ip + '.' + i, callback);
        }
    },
    scan: function scan(opts, callback) {
        var finalOpts = getBaseIp(opts);
        Object.assign(options, finalOpts);
        // console.log(options);
        var aIps = [];
        for (var i = options.min; i < options.max; i++) {
            aIps.push(options.ip + '.' + i);
        }
        async.map(aIps, getInfo, function (err, results) {
            callback(err, results);
        });
    }
};