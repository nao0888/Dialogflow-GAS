// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const https = require('https');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  
  function program(agent) {
    agent.add(`プログラムから返事をしています！`);
  }
  
  function calc(agent) {
    let num1 = agent.parameters.number[0];
    let num2 = agent.parameters.number[1];
    let ans = 0;
    if (agent.parameters.calmethod == 'たす') {
		ans = num1 + num2;      
    } else if (agent.parameters.calmethod == 'ひく') {
      	ans = num1 - num2;
    }

    agent.add(`答えは${ans}です。`);
  }
  
  function juusho(agent) {
    return new Promise((resolve, reject) => {
        //httpのリクエストを送信
        let req = https.get('https://zipcloud.ibsnet.co.jp/api/search?zipcode=7830060', (res) => {
          let chunk = '';
          //読み込み中の処理
          res.on('data', (c) => {
            chunk += c;
          });
          
          //読み込み完了時の処理
          res.on('end', () => {
            let response = JSON.parse(chunk);
            console.log('response: ' + JSON.stringify(response));
            
            //パラメータの取得
            let address = response.results[0];
            let address1 = address.address1;
            let address2 = address.address2;
            let address3 = address.address3;
            
            //表示
            agent.add(`住所:${address1 + address2 + address3}`);
            
            //処理終了
            resolve();
          });
        });
        
        //エラー時の処理
        req.on('error', (e) => {
          console.error(`エラー： ${e.message}`);
        });
    });
    
  }
  
  function tenki(agent) {
    return new Promise((resolve, reject) => {
        //httpのリクエストを送信
      	let location = agent.parameters.any;
        let req = https.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURI(location)}&appid=APPID&lang=ja`, (res) => {
          let chunk = '';
          //読み込み中の処理
          res.on('data', (c) => {
            chunk += c;
          });
          
          //読み込み完了時の処理
          res.on('end', () => {
            let response = JSON.parse(chunk);
            console.log('response: ' + JSON.stringify(response));
            
            //パラメータの取得
            let weather = response.weather[0].description;
            
            //表示
            agent.add(`${location}の天気は、${weather}です`);
            
            //処理終了
            resolve();
          });
        });
        
        //エラー時の処理
        req.on('error', (e) => {
          console.error(`エラー： ${e.message}`);
        });
    });
    
  }
  
  function yoyaku(agent) {
    return new Promise((resolve, reject) => {
        //httpのリクエストを送信
      	let name = agent.parameters.any;
        let date_context = agent.getContext('yoyaku-custom-followup');
      	let date = date_context.parameters['date-time'];
        let req = https.get(`https://script.google.com/macros/s/XXXX/exec?date=${date}&name=${encodeURI(name)}`, (res) => {
          let chunk = '';
          //読み込み中の処理
          res.on('data', (c) => {
            chunk += c;
          });
          
          //読み込み完了時の処理
          res.on('end', () => {
            
            //処理終了
            resolve();
          });
        });
        
        //エラー時の処理
        req.on('error', (e) => {
          console.error(`エラー： ${e.message}`);
        });
    });
    
  }

  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/fulfillment-actions-library-nodejs
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('program', program);
  intentMap.set('calc', calc);
  intentMap.set('juusho', juusho);
  intentMap.set('tenki', tenki);
  intentMap.set('yoyaku - name', yoyaku);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});