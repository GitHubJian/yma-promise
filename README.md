# YMA Promise

基于 PromiseA+ 规范实现的 Polyfill

## Install

```sh
npm install yma-promise
```

## Usage

```js
const Promise = require('yma-promise');

new Promise(function (resolve, reject) {
    resolve();
}).then(
    function (result) {},
    function (reason) {}
);
```
