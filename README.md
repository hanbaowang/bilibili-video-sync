# bilibili-video-sync
A chrome extension for bilibili video syncing between friends 哔哩哔哩 (゜-゜)つロ 干杯~


## for users

[中文使用说明](./docs/zh.README.md)

### install

1. install a chrome browser at first
2. visit [chrome extension page](chrome://extensions/)
3. turn on "Developer mode" switch button on the top-right corner
4. download the **bilibili-video-sync.crx** extension on [release page](https://github.com/hanbaowang/bilibili-video-sync/releases) 
5. drag **bilibili-video-sync.crx**  to [chrome extension page](chrome://extensions/)

### how to use

1. open a bilibili video page
2. click extension `b`
3. generate a id by clicking `Generate it`
4. click `Matching` to match your friends
5. share your id to your friends and he/she can input this id and click `Matching` to match you.

## for developers

### install

use `npm install` to install dependencies,
use `npm run watch` to debug,
use `npm run build` to compile and get a uglified code.

click `load unpacked` on [chrome extension page](chrome://extensions/) and select root dict of this repo to load debug version of this extension.

### current work flow

click matching -> inject a script to current page -> connect to deepstream -> share your progress or state

### future design

- [ ] popup page for indicating the state: 
    - [ ] connected
    - [ ] disconnected
    - [ ] error
- [ ] matching page hide in the ride side of bilibili video page, it can be used across pages.
    - [ ] url share support(automatically start sync when visit the url & 1-click share url)
    - [ ] generate could weather others can control or not
    - [ ] support shortcuts
- [ ] once joining following others' progress 
- [ ] options page for configuring server
- [ ] select server considering with latency
- [ ] ensure high sla

## player APIs

[flv.js api](https://github.com/bilibili/flv.js/blob/master/docs/api.md#interface-player-abstract)