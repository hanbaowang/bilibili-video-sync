chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({
    wsServer: 'ws://localhost:6020',
    idServer: 'http://localhost:6021'
  }, function() {
    console.log('websocket server has set to localhost:6020');
  });
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'www.bilibili.com'},
      })
      ],
          actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});