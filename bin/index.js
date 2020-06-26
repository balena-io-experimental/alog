#!/usr/bin/env node

const fs = require('fs');
const logutil = require('./logutil');

const getSdk = require('balena-sdk');
const balena = getSdk({
  apiUrl: "https://api.balena-cloud.com/"
});

var personalToken = fs.readFileSync('/home/hugh/.balena/token.personal', 'utf8');

balena.auth.loginWithToken(personalToken, function(error) {
  if (error) throw error;
})

balena.auth.whoami()
  .then(username => {
    if(username) {
      console.log("I am", username);
    } else {
      console.log("I am nobody? I guess?")
    }
  })

async function getDeviceServicesIds(device) {
  return await balena.models.device.getWithServiceDetails(myDevice)
    .then(device => {
      allServices = {};
      deviceServices = device.current_services;
      for (service in deviceServices) {
	// Just one service per entry?
	allServices[service] = deviceServices[service][0].id;
      }
      return allServices;
    });
}

async function subscribeToLogs(application) {
  return await balena.models.device.getAllByApplication(myApplication).then(devices => {
    // I've only got one device
    return devices[0].uuid;
  })
    .then(uuid => {
      return balena.logs.subscribe(uuid);
    })
}

subscribeToLogs(myApplication)
  .then(logs => {
    serviceIds = getDeviceServicesIds(myDevice);
    logs.on('line', function(line){
      logutil.dispatch(line);
    })
  });
