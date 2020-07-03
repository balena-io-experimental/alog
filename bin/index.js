#!/usr/bin/env node

const fs = require('fs');
const yargs = require('yargs');
const logutil = require('./logutil');

const options = yargs
      .usage("Usage: -u [uuid of device] -a [application]")
      .option("u", {alias: "uuid",
		    describe: "UUID of device",
		    type: "string",
		    demandOption: true})
      .option("a", {alias: "application",
		    describe: "Application name",
		    type: "string",
		    demandOption: true})
      .argv;

async function getDeviceServicesIds(device) {
  return await balena.models.device.getWithServiceDetails(device)
    .then(device => {
      allServices = {};
      deviceServices = device.current_services;
      for (serviceName in deviceServices) {
	// Just one service per entry?
	serviceId = parseInt(deviceServices[serviceName][0].service_id);
	allServices[serviceId] = serviceName;
      }
      return allServices;
    });
}

async function subscribeToLogs(application) {
  return await balena.models.device.getAllByApplication(application).then(devices => {
    // I've only got one device
    return devices[0].uuid;
  })
    .then(uuid => {
      return balena.logs.subscribe(uuid);
    })
}

// Set up the client...
const getSdk = require('balena-sdk');
const balena = getSdk({
  apiUrl: "https://api.balena-cloud.com/"
});

var personalToken = fs.readFileSync('/home/hugh/.balena/token.personal', 'utf8');

balena.auth.loginWithToken(personalToken, function(error) {
  if (error) throw error;
})

// Canary to make sure it works...
balena.auth.whoami()
  .then(username => {
    if(username) {
      console.log("I am", username);
    } else {
      console.log("I am nobody? I guess?")
    }
  })

// ...then try subscribing to some logs.
subscribeToLogs(options.application)
  .then(logs => {
    getDeviceServicesIds(options.uuid)
      .then(data => allServiceIds = data);
    logs.on('line', function(line) {
      logutil.dispatch(line, allServiceIds);
    })
  });
