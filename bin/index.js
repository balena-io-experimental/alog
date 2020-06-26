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

balena.models.device.getAllByApplication('arduino-wx-logger').then(devices => {
  // I've only got one device
  return devices[0].uuid;
})
  .then(uuid => {
    return balena.logs.subscribe(uuid);
  })
  .then(logs => {
    logs.on('line', function(line){
      logutil.dispatch(line);
    })
  })
