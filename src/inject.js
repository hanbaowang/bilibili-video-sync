import { DeepstreamClient } from '@deepstream/client'

class Listener {
    constructor() {
        this.state = '';
        this.idServer = '';
        this.wsServer = '';
        this.id = '';
        this.player = {};
        this.record = {};
    }

    getPlayer() {
        this.player = player;
        console.log(this.player)
    }

    getStorage() {
        this.idServer = localStorage['idServer']
        this.wsServer = localStorage['wsServer']
        this.id = localStorage['id']
    }

    addListener() {
        const client = new DeepstreamClient(this.wsServer)
        client.login()
        this.record = client.record.getRecord(this.id)
        console.log('connected')

        document.querySelector('.bilibili-player-video-btn.bilibili-player-video-btn-start')
            .addEventListener('click', this.stateController.bind(this), false);

        this.record.subscribe('state', (remoteState) => {
            console.log("remote state is ", remoteState)
            if (remoteState !== this.state) {
                if (remoteState === 'PAUSED') {
                    this.player.pause()
                } else if (remoteState === 'PLAYING') {
                    this.player.play()
                }
                this.state = remoteState;
            }
        })

                
        document.querySelector('.bilibili-player-video-progress-slider')
        .addEventListener('click', this.progressController.bind(this),false);

        this.record.subscribe('progress', (remoteProgress) => {
            console.log('remote progress is ', remoteProgress);

            const currentProgress = this.player.getCurrentTime();
            if (Math.abs(currentProgress - remoteProgress) > 3) {
                this.player.seek(remoteProgress);
            }
        })
    }

    stateController() {
        const currentState = this.player.getState();
        console.log(this.state)
        if (currentState !== this.state) {
            this.record.set('state', currentState)
            this.state = currentState;
        }
    }

    progressController() {
        const currentProgress = this.player.getCurrentTime();
        this.record.set('progress', currentProgress);
    }
}


const listener = new Listener();
listener.getPlayer()
listener.getStorage()
listener.addListener()