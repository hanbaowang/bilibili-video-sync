export class Player {
    constructor() {
        this.biliPlayer = player;
        this.updateState();
    }

    updateState() {
        this.state = this.biliPlayer.getState();
    }

    setState(state) {
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
        this.biliPlayer.seek(progress);
        console.log("player progress has set to ", progress);
        this.updateState();
    }

    getCurrentTime() {
        return this.biliPlayer.getCurrentTime();
    }




}