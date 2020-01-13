import { DeepstreamClient } from '@deepstream/client'

class Listener {
    constructor() {
        this.state = '';
        this.idServer = '';
        this.wsServer = '';
        this.id = '';
        this.player = {};
    }

    getPlayer() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                var scr = document.createElement('script');
                scr.className= 'fuckjs';
                scr.textContent = ` 
                (function() {
                    console.log(player)
                    var test = player;
                    var event = new CustomEvent("GetPlayerEvent", {
                        bubbles: true, 
                        cancelable: false,
                        detail: {
                            hello: "world",
                            t1: test,
                        }
                    });
                    window.dispatchEvent(event); 
                })()`;
                (document.head || document.documentElement).appendChild(scr);
                // scr.parentNode.removeChild(scr);
            }, 1000);
            window.addEventListener("GetPlayerEvent", function getPlayerEvent(e) {
                console.log(e)
                window.removeEventListener("GetPlayerEvent", getPlayerEvent)
                this.state = this.player.getState();
                resolve();
            });
        })
    }

    getStorage() {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(['idServer', 'wsServer', 'id'], (result) => {
                this.idServer = result['idServer'];
                this.wsServer = result['wsServer'];
                this.id = result['id'];
                resolve()
            })
        })
    }

    addListener() {
        const client = new DeepstreamClient(this.wsServer)
        client.login()
        const record = client.record.getRecord(this.id)

        document.querySelector('.bilibili-player-video-btn.bilibili-player-video-btn-start')
            .addEventListener('click', this.stateController, false)

        record.subscribe('state', (remoteState) => {
            if (remoteState !== this.state) {
                if (remoteState === 'PAUSED') {
                    this.player.pause()
                } else if (remoteState === 'PLAYING') {
                    this.player.play()
                }
                this.state = remoteState;
            }
        })
    }

    stateController() {
        let currentState = this.player.getState();
        console.log(this.state)
        if (currentState !== this.state) {
            record.set('state', currentState)
            this.state = currentState;
        }
    }
}


const listener = new Listener();
listener.getPlayer().then(() => {
    listener.getStorage().then(() => {
        listener.addListener()
    })
})
