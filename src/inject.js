import { DeepstreamClient } from '@deepstream/client'

import { Player } from "./player";
class App {
    constructor() {
        this.playerFocusOn = false;
        this.state = '';
        this.idServer = '';
        this.wsServer = '';
        this.id = '';
        this.player = new Player();
        this.record = {};

    }

    start() {
        this._getStorage()._connect();
        if (this.state === 'hosted') {
            this._setController();
        } else {
            this._setSubscriber();
        }
    }

    _getStorage() {
        this.idServer = localStorage['idServer'];
        this.wsServer = localStorage['wsServer'];
        this.id = localStorage['id'];
        this.state = localStorage['state'];
        return this;
    }

    _setStateSubscriber() {
        this.record.subscribe('state', (remoteState) => {
            console.log("remote state is ", remoteState)
            if (remoteState !== this.player.getState()) {
                this.player.setState(remoteState)
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

    _newcomerSubscriber() {
        this.record.subscribe('newcomer', () => {
            this._progressController();
            this._stateController();
        })
    }

    _stateController(time) {
        setTimeout(() => {
            const state = this.player.getState();
            if (state === "READY" || state === "BUFFERING") {
                this._stateController(500);
                return
            }
            this.record.set('state', state);
            console.log('state has set to', state);
        }, time || 0);
    }

    _progressController() {
        setTimeout(() => {
            const progress = this.player.getCurrentTime();
            console.log('progress has set to', progress)
            this.record.set('progress', progress);
        }, 0);
    }

    _newcomerController() {
        this.record.set('newcomer', 1);
    }

    _shortcutController(e) {
        console.log(this.playerFocusOn)
        if (!this.playerFocusOn) {
            return false;
        }
        switch (e.code) {
            case 'Space':
                this._stateController();
                break;
            case 'ArrowRight':
                this.player.seek(this.player.getCurrentTime() + 5);
                this._progressController()
            case 'ArrowLeft':
                this.player.seek(this.player.getCurrentTime() - 5);
                this._progressController()
            default:
                break;
        }
    }

    _updatePlayerFoucsOn(e) {
        this.playerFocusOn = $(e.target).parents('#bilibiliPlayer').length > 0;
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

        document.querySelector('.bilibili-player-video-progress')
            .addEventListener('mouseup', this._progressController.bind(this), false);
        const pbp = document.getElementById('bilibili_pbp')
        if (pbp !== null) {
            pbp.addEventListener('mouseup', this._progressController.bind(this), false);
        }

        document.addEventListener('keydown', this._shortcutController.bind(this), false)

        document.addEventListener('click', this._updatePlayerFoucsOn.bind(this), false);
    }

    _setSubscriber() {
        this._setStateSubscriber();
        this._setProgressSubscriber();
    }
}


function init() {
    if (typeof player.play !== 'undefined') {
        const app = new App();
        app.start();
    } else {
        setTimeout(() => {
            init()
        }, 500);
    }
}

init();


