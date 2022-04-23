    // See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
    // for Dialogflow fulfillment library docs, samples, and to report issues
    'use strict';
     
    const functions = require('firebase-functions');
    const App = require('actions-on-google').DialogflowApp;
    const {WebhookClient} = require('dialogflow-fulfillment');
    const {Card, Suggestion} = require('dialogflow-fulfillment');
    
    const https = require('https');
     
    process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
     
    exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
      const agent = new WebhookClient({ request, response });
      console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
      console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
         
      function PostTest(agent) {
        return new Promise((resolve, reject) => {
          
          var headers = {
            'Content-Type':'application/json'
          };
          
          let options = {
            host: 'script.google.com',
            path: '/macros/s/AKfycby75IdM7Xmh7L-Ebzq507tbpHolgfLxZpcYosstgP2Rp0QdrTTV/exec',
            method: 'POST',
            headers: headers
          };

          let message = {
            param: 'TestMessage'
          };
          
          let req = https.request(options, (res) => {
            let chunk = '';
            res.on('data', (c) => {
              console.log(`BODY: ${c}`);
              chunk = c;
            });
            res.on('end', () => {
                agent.add('リクエスト成功');
                resolve();
            });
          });
          req.on('error', (e) => {
            console.log(`エラー： ${e.message}`);
          });
          req.write(JSON.stringify(message));
          req.end();
        });
      }
    
      // Run the proper function handler based on the matched Dialogflow intent name
      let intentMap = new Map();
      intentMap.set('PostTest', PostTest);
      agent.handleRequest(intentMap);
    });