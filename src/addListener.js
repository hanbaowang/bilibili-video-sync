function injectScript() {
    var script = document.createElement('script');
    script.id = 'bilibili-video-sync';
    script.src = chrome.extension.getURL('inject.js');
    document.head.appendChild(script);
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
    console.log('first check')
    getStorage().then(() => {
        if (document.getElementById('bilibili-video-sync') === null) {
            console.log('second check')
            injectScript()
        }
    })
} else {
    console.log('custom event')
    const url = location.href;
    var event = new CustomEvent("readdListener", {
        detail: {
            readd: true,
            url
        }
    });
    window.dispatchEvent(event);
}
