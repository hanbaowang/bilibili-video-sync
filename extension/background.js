chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({
    wsServer: 'wss://ss.battles.xyz',
    idServer: 'https://ss.battles.xyz/server'
  }, function () {
    console.log('server has set to ss.battles.xyz');
  });
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { hostEquals: 'www.bilibili.com' },
      })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });

  chrome.tabs.onUpdated.addListener((tab) => {
    
    chrome.storage.sync.get(['state', 'id'], function (result) {
      const state = result['state'];
      const id = result['id'];
      console.error('test start', id, state)

      if (id !== null && (state === 'hosted' || state === 'matched')) {
        inject(tab);
        console.error('state initialed');
      }
    });
  })


});


function inject(tab) {
  chrome.tabs.executeScript(
    tab.id,
    {
      file: 'addListener.js'
    }, _ => {
      let e = chrome.runtime.lastError;
      if (e !== undefined) {
        console.log(_, e);
      }
    });
}