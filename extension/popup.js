const input = document.getElementById('random')
const content = document.getElementById('content')
const back = document.getElementById('back')
const generate = document.getElementById('generate')
const matching = document.getElementById('matching')

const msm = new StateMachine();
const initState = createState();
msm.init(
  {
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
  }
)


let idServer = '', wsServer = '';

chrome.storage.sync.get(['idServer', 'wsServer', 'id', 'state'], (result) => {
  idServer = result['idServer'];
  wsServer = result['wsServer'];
  let id = result['id'];
  let state = result['state'] || 'initialed';
  
  initState(state, id);
})

async function host() {
  const id = await generateId();

  if (!await checkId(id)) {
    return false;
  }

  inject();

  const state = 'hosted';

  chrome.storage.sync.set({
    state,
    id
  });

  // TODO: if any bug, try to set timeout 0
  generate.removeEventListener('click', host, false);

  initState(state);
}

function reset() {
  const state = 'initialed';

  eject()

  chrome.storage.sync.set({
    state,
    id: null
  })

  generate.removeEventListener('click', copy, false);
  matching.removeEventListener('click', search, false);
  back.removeEventListener('click', reset, false);

  initState(state)
}

function search() {
  const state = 'search';

  inject();

  chrome.storage.sync.set({
    state
  })

  matching.removeEventListener('click', search, false);

  initState(state);
}

function match() {
  const id = input.value;
  if (await checkId(id)) {
    return
  }

  const state = 'matched';

  chrome.storage.sync.set({
    state,
    id
  })

  matching.removeEventListener('click', match, false);

  initState(state, id);
}

function rematch() {
  const state = 'search';

  chrome.storage.sync.set({
    state,
    id: null
  })

  matching.removeEventListener('click', rematch, false);

  initState(state);
}

function createState() {
  const initialed = () => {
    content.style.display = 'none';
    input.disable = true;
    back.style.display = 'none';
    generate.style.display = 'block';
    generate.innerText = 'Create a room'
    matching.style.display = 'block';
    matching.innerText = 'Join a room';

    generate.addEventListener('click', msm.getTransition('initialed', 'hosted'), false);
    matching.addEventListener('click', msm.getTransition('initialed', 'search'), false);
  };
  const hosted = (id) => {
    content.style.display = 'flex';
    input.value = id;
    input.disable = true;
    back.style.display = 'inline-block';
    generate.style.display = 'none';
    matching.style.display = 'block';
    matching.innerText = 'Copy';

    matching.addEventListener('click', copy, false);
    back.addEventListener('click', msm.getTransition('hosted', 'initialed'), false);
  };
  const search = (id) => {
    content.style.display = 'flex';
    input.value = id;
    input.disable = false;
    back.style.display = 'inline-block';
    generate.style.display = 'none';
    matching.style.display = 'block';
    matching.innerText = 'Join';

    matching.addEventListener('click', msm.getTransition('search', 'matched'), false);
    back.addEventListener('click', msm.getTransition('search', 'initialed'), false);
  }
  const matched = (id) => {
    content.style.display = 'flex';
    input.value = id;
    input.disable = true;
    back.style.display = 'inline-block';
    generate.style.display = 'none';
    matching.style.display = 'none';

    back.addEventListener('click', msm.getTransition('matched', 'search'), false);
  };

  const mapping = {
    initialed, hosted, search, matched
  }

  const fn = (state, id) => {
    if (typeof mapping[state] !== 'undefined')
      mapping[state](id);
  }

  return fn;
}

async function checkId(id) {
  const checkRes = await fetch(idServer + '/check' + '?id=' + id);
  const check = await checkRes.json();
  if (check && check.status === false) {
    console.error(check.error);
  }
  return check.status;
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
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      {
        file: 'addListener.js'
      });
  });
}

function eject() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      {
        file: 'removeListener.js'
      });
  });
}

async function generateId() {
  const res = await (await fetch(idServer + '/generate')).text()
  console.log(res);
  return res;
}

// =========StateMachine===========
let StateMachine = {
  mapping: {}
}

StateMachine.prototype.init = function (mapping) {
  this.mapping = mapping;
}

StateMachine.prototype.getTransition = function (from, to) {
  let start = this.mapping[from];
  if (typeof start === 'undefined') {
    console.error("no such state")
    return false;
  }
  let end = start[to];
  if (typeof end !== 'function') {
    console.error("no such state")
    return false;
  }
  return end;
}