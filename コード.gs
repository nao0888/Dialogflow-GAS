function myFunction() {
   var replyToken= JSON.parse(e.postData.contents).events[0].replyToken;
  if (typeof replyToken === 'undefined') {
    return;
  }
 
  var url = 'https://api.line.me/v2/bot/message/reply';
  var channelKey = 'こちらにチャンネルのアクセストークンを入力してください。';
 
  var messages = [{
    'type': 'text',
    'text': 'おはようございます!!',
  }];
 
  UrlFetchApp.fetch(url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + channelKey,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages': messages,
    }),
  });
  return ContentService.createTextOutput(JSON.stringify({'content': 'post ok'})).setMimeType(ContentService.MimeType.JSON);
}