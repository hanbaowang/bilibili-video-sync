const input = document.getElementById('ramdon')
const generate = document.getElementById('generate')
const matching = document.getElementById('matching')

let idServer = '', wsServer = '';
chrome.storage.sync.get(['idServer', 'wsServer'], (result) => {
  idServer = result['idServer'];
  wsServer = result['wsServer'];
})

generate.addEventListener('click', async () => {
  const res = await (await fetch(idServer)).json()
  console.log(res);
  input.value = res
}, false)

matching.addEventListener('click', async () => {
  const id = input.value;
  const check = await (await fetch(idServer + '?id=' + id)).json();
  if (check && check.status === false) {
    console.error(check.error)
  }

  chrome.storage.sync.set({
    id
  }, function() {
    console.log('id is ', id);
  });

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      {
        file: ['addListener.js']
      });
  });
}, false)