const Promise = require('../src');

new Promise(function (resolve, reject) {
    setTimeout(function () {
        resolve(1);
    });
})
    .then(res => {
        console.log(res);

        return 2;
    })
    .then(res => {
        console.log(res);
    });
