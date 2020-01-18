import { DeepstreamClient } from '@deepstream/client'

import { Player } from "./player";
class App {
    constructor() {
        this.playerFocusOn = false;
        this.idServer = '';
        this.wsServer = '';
        this.id = '';
        this.player = new Player();
        this.record = {};
        this._connect();
    }

    getStorage() {
        this.idServer = localStorage['idServer'];
        this.wsServer = localStorage['wsServer'];
        this.id = localStorage['id'];
        return this;
    }

    _setStateSubscriber() {
        this.record.subscribe('state', (remoteState) => {
            console.log("remote state is ", remoteState)
            if (remoteState !== this.player.getState()) {
                this.player.toggleState()
            }
        })
    }

    _setProgressSubscriber() {
        this.record.subscribe('progress', (remoteProgress) => {
            console.log('remote progress is ', remoteProgress);

            const currentProgress = this.player.getCurrentTime();
            if (Math.abs(currentProgress - remoteProgress) > 1) {
                this.player.seek(remoteProgress);
            }
        })
    }

    _stateController() {
        this.record.set('state', this.player.getState());
    }

    _progressController() {
        this.record.set('progress', this.player.getCurrentTime());
    }

    _shortcutController(e) {
        if (!this.playerFocusOn) {
            return false;
        }
        switch (e.code) {
            case 'Space':
                this.player.toggle();
                break;
            case 'ArrowRight':
                this.player.seek(this.player.getCurrentTime() + 5);
            case 'ArrowLeft':
                this.player.seek(this.player.getCurrentTime() - 5);
            default:
                break;
        }
        return true;
    }

    _updatePlayerFoucsOn(e) {
        this.playerFocusOn = $(e.target).parents('#bilibiliPlayer').length > 0;
        console.log(this.playerFocusOn);
    }

    _connect() {
        const client = new DeepstreamClient(this.wsServer);
        client.login();
        this.record = client.record.getRecord(this.id);
        console.log('connected');
        return this;
    }

    _setController() {
        document.querySelector('.bilibili-player-video-btn.bilibili-player-video-btn-start')
            .addEventListener('click', this._stateController.bind(this), false);

        document.querySelector('.bilibili-player-video-progress-slider')
            .addEventListener('mouseup', this._progressController.bind(this), false);

        document.addEventListener('keydown', this._shortcutController.bind(this), false)

        document.addEventListener('click', this._)
    }

    _setSubscriber() {
        this._setStateSubscriber();
        this._setProgressSubscriber();
    }
}


const app = new App();
