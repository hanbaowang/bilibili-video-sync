const input = document.getElementById('random')
const generate = document.getElementById('generate')
const matching = document.getElementById('matching')

let idServer = '', wsServer = '', id;
chrome.storage.sync.get(['idServer', 'wsServer', 'id'], (result) => {
  idServer = result['idServer'];
  wsServer = result['wsServer'];
  id = result['id'];
  console.log(id)

  if (!id) {
    generate.addEventListener('click', generateListeners, false);
  } else {
    console.log(id)

    input.value = id;
    generate.innerText = 'clear id';
    generate.addEventListener('click', clearListeners, false);
  }
  matching.addEventListener('click', matchingListeners, false)
})

async function checkId(id) {
  const checkRes = await fetch(idServer + '/check' + '?id=' + id);
  const check = await checkRes.json();
  if (check && check.status === false) {
    console.error(check.error);
  }
  return check.status;
}

async function setId(id) {
  chrome.storage.sync.set({
    id
  }, function () {
    console.log('id is ', id);
  });
}

function clearListeners() {
  input.value = '';
  chrome.storage.sync.set({
    id: null
  }, function () {
    console.log('id is ', null);
  });
}

async function generateListeners() {
  const res = await (await fetch(idServer + '/generate')).text()
  console.log(res);
  input.value = res
}

async function matchingListeners() {
  id = input.value;

  if (!checkId(id)) {
    return false
  }

  setId(id)
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      {
        file: 'addListener.js'
      });
    const expireTime = Date.now() + 2 * 60 * 60
    chrome.storage.sync.set({
      expireTime
    }, function () {
      console.log('expireTime ', expireTime);
    });
  });

  generate.innerText = 'clear id';
  generate.removeEventListener('click', generateListeners, false);
  generate.addEventListener('click', clearListeners, false);

  return true;
}
