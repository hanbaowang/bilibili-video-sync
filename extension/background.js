chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({
    wsServer: 'wss://YOUR.SERVER',
    idServer: 'https://YOUR.SERVER'
  }, function() {
    console.log('server has set to YOUR SERVER');
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