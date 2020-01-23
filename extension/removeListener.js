var script = script || document.getElementById('bilibili-video-sync');

var event = new CustomEvent("destroyListener", {
    detail: {
        destroyId: true
    }
});
window.dispatchEvent(event);

if (script !== null) {
    script.remove();
}

