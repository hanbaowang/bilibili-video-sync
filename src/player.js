export class Player {
    constructor() {
        this.biliPlayer = player;
        this.updateState();
        this.queue = [];
    }

    updateState() {
        this.state = this.biliPlayer.getState();
    }

    setState(state) {
        if (this.queue.length > 0) {
            setTimeout(() => {
                this.setState(state);
            }, 1000);
        }
        if (state === 'PLAYING') {
            this.biliPlayer.play();
        } else {
            this.biliPlayer.pause();
        }
        this.updateState()
        console.log("player state toggled, ", this.state);
    }

    getState() {
        this.updateState();
        return this.state;
    }

    seek(progress) {
        this.queue.push(progress);
        this.biliPlayer.seek(progress);
        const loadingInterval = setInterval(() => {
            if (this.getState() === "PLAYING") {
                clearInterval(loadingInterval);
                this.queue.shift();
            }
        }, 1000);
        console.log("player progress has set to ", progress);
    }

    getCurrentTime() {
        return this.biliPlayer.getCurrentTime();
    }




}