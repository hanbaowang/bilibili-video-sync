function injectScript() {
    return new Promise((resolve, reject) => {
        var script = document.createElement('script');
        script.id = 'bilibili-video-sync';
        script.src = chrome.extension.getURL('inject.js');
        document.head.appendChild(script);
        resolve()
    })
}

function getStorage() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(['idServer', 'wsServer', 'id', 'state'], (result) => {
            localStorage['idServer'] = result['idServer'];
            localStorage['wsServer'] = result['wsServer'];
            localStorage['id'] = result['id'];
            localStorage['state'] = result['state'];
            resolve()
        })
    })
}

if (document.getElementById('bilibili-video-sync') === null) {
    getStorage().then(() => {
        if (document.getElementById('bilibili-video-sync') === null) {
            injectScript()
        }
    })
}
