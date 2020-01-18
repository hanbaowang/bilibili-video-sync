export class Player {
    constructor() {
        this.biliPlayer = player;
        this.state = '';
        this.progress = 0;
    }
    
    toggleState() {
        this.state = this.biliPlayer.getState();
        if (this.state === 'PAUSED') {
            this.biliPlayer.play();
        } else {
            this.biliPlayer.pause();
        }
        this.state = this.biliPlayer.getState();
        console.log("player state toggled, ", this.state);
    }

    getState() {
        return this.state;
    }

    seek(progress) {
        this.biliPlayer.seek(progress);
        console.log("player progress has set to ", progress);
        this.state = this.biliPlayer.getState(); 
    }

    getCurrentTime() {
        return this.biliPlayer.getCurrentTime();
    }




}