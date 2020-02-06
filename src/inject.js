import { DeepstreamClient } from '@deepstream/client'

import { Player } from "./player";
import { bvsNotify } from "./notify";
class App {
    constructor(url) {
        this.playerFocusOn = false;
        this.state = '';
        this.idServer = '';
        this.wsServer = '';
        this.id = '';
        this.player = new Player();
        this.record = {};
        this.lastHeartbeat = Date.now();
        this.connected = false;
        this.reconnection = 0;
        this.reconnectInterval = null;
        this.url = url;
    }

    start() {
        this._getStorage()._connect();
        if (this.state === 'hosted') {
            this._setControllers();
        } else {
            this._setSubscribers();
        }
    }

    _getStorage() {
        this.idServer = localStorage['idServer'];
        this.wsServer = localStorage['wsServer'];
        this.id = localStorage['id'];
        this.state = localStorage['state'];
        return this;
    }

    _heartbeatSubscriber() {
        let interval = setInterval(() => {
            if (Date.now() - this.lastHeartbeat > 30 * 1000) {
                bvsNotify("已失去与主机的连接");
                clearInterval(interval);
            }
        }, 5 * 1000)
        this.record.subscribe('heartbeat', (heartbeat) => {
            this.lastHeartbeat = heartbeat;
        })
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

    _welcomeSubscriber() {
        this.record.subscribe('welcome', (time) => {
            this.connected = true;
            if (time - this.lastHeartbeat > 0) {
                this.lastHeartbeat = time;
            }
        })
    }

    _newcomerSubscriber() {
        this.record.subscribe('newcomer', () => {
            this._progressController();
            this._stateController();
            this._welcomeNewcomer();
            bvsNotify('有新人加入进来了呢');
        })
    }

    _welcomeNewcomer() {
        this.record.set('welcome', Date.now())
    }

    _heartbeatController() {
        setInterval(() => {
            this.record.set('heartbeat', Date.now(), err => {
                if (err) {
                    console.log('heartbeat err', err);
                }
            })
        }, 5 * 1000)
    }

    _stateController(time) {
        setTimeout(() => {
            const state = this.player.getState();
            if (state === "READY" || state === "BUFFERING") {
                this._stateController(500);
                return
            }
            this.record.set('state', state, err => {
                console.log('test', err)
            });
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
        this.reconnectInterval = setInterval(() => {
            if (this.connected === true) {
                bvsNotify("已连接主机，用番愉快~");
                clearInterval(this.reconnectInterval);
                return
            }
            if (this.connected === false && this.reconnection < 3) {
                this.reconnection++;
                bvsNotify(`已经尝试了 ${this.reconnection} 次连接，但是没连接上呢>_<`)
            } else {
                bvsNotify(`没有发现主机哎`);
                clearInterval(this.reconnectInterval);
            }
        }, 5 * 1000)
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
        bvsNotify('已连接至服务器');
        return this;
    }

    _setControllers() {
        this._newcomerSubscriber();

        this._heartbeatController();

        document.querySelector('.bilibili-player-video-btn.bilibili-player-video-btn-start')
            .addEventListener('click', this._stateController.bind(this), false);
        const item = document.querySelector('.bilibili-player-video-toast-item-jump')
            item.addEventListener('click', this._stateController.bind(this), false);

        document.querySelector('.bilibili-player-video-progress')
            .addEventListener('mouseup', this._progressController.bind(this), false);
        const pbp = document.getElementById('bilibili_pbp')
        if (pbp !== null) {
            pbp.addEventListener('mouseup', this._progressController.bind(this), false);
        }
        document.querySelector('.bilibili-player-video-toast-item-jump')
            .addEventListener('click', this._progressController.bind(this), false);

        document.addEventListener('keydown', this._shortcutController.bind(this), false)

        document.addEventListener('click', this._updatePlayerFoucsOn.bind(this), false);

        window.addEventListener("destroyListener", this.destroyListener.bind(this), false);

    }

    _setSubscribers() {
        this._heartbeatSubscriber();
        this._setStateSubscriber();
        this._setProgressSubscriber();
        this._newcomerController();
    }

    destroyListener() {

        document.querySelector('.bilibili-player-video-btn.bilibili-player-video-btn-start')
            .removeEventListener('click', this._stateController.bind(this));

        document.querySelector('.bilibili-player-video-progress')
            .removeEventListener('mouseup', this._progressController.bind(this));
        const pbp = document.getElementById('bilibili_pbp')
        if (pbp !== null) {
            pbp.removeEventListener('mouseup', this._progressController.bind(this));
        }

        document.removeEventListener('keydown', this._shortcutController.bind(this))

        document.removeEventListener('click', this._updatePlayerFoucsOn.bind(this));

        this.record.discard();
    }
}


function init(url) {
    if (typeof player !== 'undefined' && typeof player.play !== 'undefined' && !app) {
        app = new App(url);
        app.start();
    } else {
        setTimeout(() => {
            init(url)
        }, 500);
    }
}

let app;
let url = location.href;
init(url);


window.addEventListener('readdListener', (e) => {
    console.log(app)
    console.log(e.detail)
    const url = e.detail.url;
    if (typeof app === 'undefined') {
        init(url);
    } else if (app.url !== url) {
        app.destroyListener();
        app = null;
        init(url)
    }
}, false)