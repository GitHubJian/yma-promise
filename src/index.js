function Promise(executor) {
    const that = this;

    this.state = 'pending';
    this.value = undefined;
    this.handlers = [];

    this.$handle = function (handler) {
        if (that.state === 'pending') {
            that.handlers.push(handler);
        } else if (that.state === 'fulfilled') {
            handler.onFulfilled(that.value);
        } else if (that.state === 'rejected') {
            handler.onRejected(that.value);
        }
    };

    function resolve(value) {
        if (that.state === 'pending') {
            that.state = 'fulfilled';
            that.value = value;
            that.handlers.forEach(function (handler) {
                return that.$handle(handler);
            });
        }
    }

    function reject(reason) {
        if (that.state === 'pending') {
            that.state = 'rejected';
            that.value = reason;
            that.handlers.forEach(function (handler) {
                return that.$handle(handler);
            });
        }
    }

    try {
        executor(resolve, reject);
    } catch (error) {
        reject(error);
    }
}

Promise.prototype.then = function then(onFulfilled, onRejected) {
    let that = this;

    return new Promise(function (resolve, reject) {
        let handler = {
            onFulfilled: function (value) {
                try {
                    let result = onFulfilled ? onFulfilled(value) : value;
                    if (result instanceof Promise) {
                        result.then(resolve, reject);
                    } else {
                        resolve(result);
                    }
                } catch (error) {
                    reject(error);
                }
            },
            onRejected: function (reason) {
                try {
                    let result = onRejected ? onRejected(reason) : reason;
                    if (result instanceof Promise) {
                        result.then(resolve, reject);
                    } else {
                        resolve(result);
                    }
                } catch (error) {
                    reject(error);
                }
            },
        };

        that.$handle(handler);
    });
};

Promise.prototype['catch'] = function $catch(onRejected) {
    return this.then(null, onRejected);
};

Promise.prototype.finally = function $finally(onFinally) {
    return this.then(
        function (value) {
            return Promise.resolve(onFinally()).then(function () {
                return value;
            });
        },
        function (reason) {
            return Promise.resolve(onFinally()).then(function () {
                throw reason;
            });
        }
    );
};

Promise.resolve = function resolve(value) {
    return new Promise(function (resolve) {
        return resolve(value);
    });
};

Promise.reject = function reject(reason) {
    return new Promise(function (resolve, reject) {
        return reject(reason);
    });
};

Promise.all = function all(promises) {
    return new Promise(function (resolve, reject) {
        let results = [];
        let completedCount = 0;
        let checkCompletion = function () {
            if (completedCount === promises.length) {
                resolve(results);
            }
        };
        promises.forEach(function (promise, index) {
            promise
                .then(function (value) {
                    results[index] = value;
                    completedCount++;
                    checkCompletion();
                })
                ['catch'](function (reason) {
                    reject(reason);
                });
        });
    });
};

Promise.race = function race(promises) {
    return new Promise(function (resolve, reject) {
        promises.forEach(function (promise) {
            promise
                .then(function (value) {
                    resolve(value);
                })
                ['catch'](function (reason) {
                    reject(reason);
                });
        });
    });
};

Promise.allSettled = function allSettled(promises) {
    return new Promise(function (resolve) {
        let results = [];
        let completedCount = 0;
        let checkCompletion = function () {
            if (completedCount === promises.length) {
                resolve(results);
            }
        };
        promises.forEach(function (promise, index) {
            promise
                .then(function (value) {
                    results[index] = {status: 'fulfilled', value: value};
                    completedCount++;
                    checkCompletion();
                })
                ['catch'](function (reason) {
                    results[index] = {status: 'rejected', reason: reason};
                    completedCount++;
                    checkCompletion();
                });
        });
    });
};

Promise.any = function any(promises) {
    return new Promise(function (resolve, reject) {
        let completedCount = 0;
        let checkCompletion = function () {
            if (completedCount === promises.length) {
                reject(new Error('All promises were rejected'));
            }
        };
        promises.forEach(function (promise) {
            promise
                .then(function (value) {
                    resolve(value);
                })
                ['catch'](function (reason) {
                    completedCount++;
                    checkCompletion();
                });
        });
    });
};

module.exports = Promise;
