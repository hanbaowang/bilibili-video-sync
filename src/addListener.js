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
        chrome.storage.sync.get(['idServer', 'wsServer', 'id'], (result) => {
            localStorage['idServer'] = result['idServer'];
            localStorage['wsServer'] = result['wsServer'];
            localStorage['id'] = result['id'];
            resolve()
        })
    })
}

if (document.getElementById('bilibili-video-sync') !== null) {
    getStorage().then(() => {
        injectScript()
    })
}
