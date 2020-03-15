const input = document.getElementById("random");
const content = document.getElementById("content");
const back = document.getElementById("back");
const generate = document.getElementById("generate");
const matching = document.getElementById("matching");
const help = document.getElementById("help");

help.addEventListener("click", () => {
    window.open(
        "https://github.com/hanbaowang/bilibili-video-sync/blob/dev/docs/zh.README.md"
    );
});

// =========StateMachine===========
let StateMachine = function() {
    this.mapping = {};
};

StateMachine.prototype.init = function(mapping) {
    this.mapping = mapping;
};

StateMachine.prototype.getTransition = function(from, to) {
    let start = this.mapping[from];
    if (typeof start === "undefined") {
        console.error("no such state");
        return false;
    }
    let end = start[to];
    if (typeof end !== "function") {
        console.error("no such state");
        return false;
    }
    return end;
};

const msm = new StateMachine();
const initState = createState();
msm.init({
    initialed: {
        hosted: host,
        search: search
    },
    hosted: {
        initialed: reset
    },
    search: {
        matched: match,
        initialed: reset
    },
    matched: {
        search: rematch
    }
});

let idServer = "",
    wsServer = "";

chrome.storage.sync.get(["idServer", "wsServer", "id", "state"], result => {
    idServer = result["idServer"];
    wsServer = result["wsServer"];
    let id = result["id"] || "";
    let state = result["state"] || "initialed";

    initState(state, id);
});

async function host() {
    const id = await generateId();

    if (!(await checkId(id))) {
        return false;
    }

    inject();

    const state = "hosted";

    chrome.storage.sync.set({
        state,
        id
    });

    initState(state, id);
}

function reset() {
    const state = "initialed";

    eject();

    chrome.storage.sync.set({
        state,
        id: null
    });

    initState(state);
}

function search() {
    const state = "search";

    chrome.storage.sync.set({
        state
    });

    initState(state);
}

async function match() {
    const id = input.value;
    if (!(await checkId(id))) {
        return;
    }

    const state = "matched";

    chrome.storage.sync.set({
        state,
        id
    });

    inject();

    initState(state, id);
}

function rematch() {
    const state = "search";

    eject();

    chrome.storage.sync.set({
        state,
        id: null
    });

    initState(state);
}

function createState() {
    const initialed = () => {
        content.style.display = "none";
        input.disabled = true;
        back.style.display = "none";
        generate.style.display = "block";
        generate.innerText = "创建房间->";
        matching.style.display = "block";
        matching.innerText = "加入房间->";

        removeAllEventListener();

        generate.addEventListener(
            "click",
            msm.getTransition("initialed", "hosted"),
            false
        );
        matching.addEventListener(
            "click",
            msm.getTransition("initialed", "search"),
            false
        );
    };
    const hosted = id => {
        content.style.display = "flex";
        input.value = id;
        input.disabled = false;
        back.style.display = "inline-block";
        generate.style.display = "none";
        matching.style.display = "block";
        matching.innerText = "Copy";

        removeAllEventListener();

        matching.addEventListener("click", copy, false);
        back.addEventListener(
            "click",
            msm.getTransition("hosted", "initialed"),
            false
        );
    };
    const search = id => {
        content.style.display = "flex";
        input.value = id;
        input.disabled = false;
        input.focus();
        back.style.display = "inline-block";
        generate.style.display = "none";
        matching.style.display = "block";
        matching.innerText = "Join";

        removeAllEventListener();

        matching.addEventListener(
            "click",
            msm.getTransition("search", "matched"),
            false
        );
        back.addEventListener(
            "click",
            msm.getTransition("search", "initialed"),
            false
        );
    };
    const matched = id => {
        content.style.display = "flex";
        input.value = id;
        input.disabled = true;
        back.style.display = "inline-block";
        generate.style.display = "none";
        matching.style.display = "none";

        removeAllEventListener();

        back.addEventListener(
            "click",
            msm.getTransition("matched", "search"),
            false
        );
    };

    const mapping = {
        initialed,
        hosted,
        search,
        matched
    };

    const fn = (state, id = "") => {
        if (typeof mapping[state] !== "undefined") mapping[state](id);
    };

    return fn;
}

async function checkId(id) {
    try {
        const checkRes = await fetch(idServer + "/check" + "?id=" + id);
        const check = await checkRes.json();
        if (check && check.status === false) {
            new Notification("2233", {
                body: "加入房间失败，没有找到对应的id呢>_<"
            });
            console.error(check.error);
            input.focus();
        }
        return check.status;
    } catch (e) {
        console.log(e);
        new Notification("2233", {
            body: "加入房间失败，看起来是服务器故障了呢>_<"
        });
    }
}

// function setExpireTime() {
//   const expireTime = Date.now() + 2 * 60 * 60
//   chrome.storage.sync.set({
//     expireTime
//   }, function () {
//     console.log('expireTime ', expireTime);
//   });
// }

function inject() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.executeScript(tabs[0].id, {
            file: "addListener.js"
        });
    });
}

function eject() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.executeScript(tabs[0].id, {
            file: "removeListener.js"
        });
    });
}

async function generateId() {
    try {
        const res = await fetch(idServer + "/generate");
        const rest = await res.text();
        return rest;
    } catch (e) {
        console.log(e);
        new Notification("2233", {
            body: "创建房间失败，看起来是服务器故障了呢>_<"
        });
    }
}

function copy() {
    input.select();
    document.execCommand("copy");
}

function removeAllEventListener() {
    // TODO performance
    back.removeEventListener("click", reset, false);
    back.removeEventListener("click", rematch, false);

    generate.removeEventListener("click", host, false);

    matching.removeEventListener("click", copy, false);
    matching.removeEventListener("click", search, false);
    matching.removeEventListener("click", match, false);
}
