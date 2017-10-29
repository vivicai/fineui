function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) : typeof define === 'function' && define.amd ? define(['exports'], factory) : factory(global.Fix = global.Fix || {});
})(this, function (exports) {
    'use strict';

    function noop(a, b, c) {}

    function isNative(Ctor) {
        return typeof Ctor === 'function' && /native code/.test(Ctor.toString());
    }

    var rhashcode = /\d\.\d{4}/;

    //生成UUID http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
    function makeHashCode(prefix) {
        /* istanbul ignore next*/
        prefix = prefix || 'bi';
        /* istanbul ignore next*/
        return String(Math.random() + Math.random()).replace(rhashcode, prefix);
    }

    var hasProto = '__proto__' in {};

    var getIEVersion = function getIEVersion() {
        var version = 0;
        var agent = navigator.userAgent.toLowerCase();
        var v1 = agent.match(/(?:msie\s([\w.]+))/);
        var v2 = agent.match(/(?:trident.*rv:([\w.]+))/);
        if (v1 && v2 && v1[1] && v2[1]) {
            version = Math.max(v1[1] * 1, v2[1] * 1);
        } else if (v1 && v1[1]) {
            version = v1[1] * 1;
        } else if (v2 && v2[1]) {
            version = v2[1] * 1;
        } else {
            version = 0;
        }
        return version;
    };
    var isIE9Below = getIEVersion() < 9;

    var _toString = Object.prototype.toString;

    function isPlainObject(obj) {
        return _toString.call(obj) === '[object Object]';
    }

    function remove(arr, item) {
        if (arr.length) {
            var _index = arr.indexOf(item);
            if (_index > -1) {
                return arr.splice(_index, 1);
            }
        }
    }

    var bailRE = /[^\w.$]/;

    function parsePath(path) {
        if (bailRE.test(path)) {
            return;
        }
        var segments = path.split('.');
        return function (obj) {
            for (var i = 0; i < segments.length; i++) {
                if (!obj) return;
                obj = obj[segments[i]];
            }
            return obj;
        };
    }

    var nextTick = function () {
        var callbacks = [];
        var pending = false;
        var timerFunc = void 0;

        function nextTickHandler() {
            pending = false;
            var copies = callbacks.slice(0);
            callbacks.length = 0;
            for (var i = 0; i < copies.length; i++) {
                copies[i]();
            }
        }

        // An asynchronous deferring mechanism.
        // In pre 2.4, we used to use microtasks (Promise/MutationObserver)
        // but microtasks actually has too high a priority and fires in between
        // supposedly sequential events (e.g. #4521, #6690) or even between
        // bubbling of the same event (#6566). Technically setImmediate should be
        // the ideal choice, but it's not available everywhere; and the only polyfill
        // that consistently queues the callback after all DOM events triggered in the
        // same loop is by using MessageChannel.
        /* istanbul ignore if */
        if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
            timerFunc = function timerFunc() {
                setImmediate(nextTickHandler);
            };
        } else if (typeof MessageChannel !== 'undefined' && (isNative(MessageChannel) ||
        // PhantomJS
        MessageChannel.toString() === '[object MessageChannelConstructor]')) {
            var channel = new MessageChannel();
            var port = channel.port2;
            channel.port1.onmessage = nextTickHandler;
            timerFunc = function timerFunc() {
                port.postMessage(1);
            };
        } else
            /* istanbul ignore next */
            if (typeof Promise !== 'undefined' && isNative(Promise)) {
                // use microtask in non-DOM environments, e.g. Weex
                var p = Promise.resolve();
                timerFunc = function timerFunc() {
                    p.then(nextTickHandler);
                };
            } else {
                // fallback to setTimeout
                timerFunc = function timerFunc() {
                    setTimeout(nextTickHandler, 0);
                };
            }

        return function queueNextTick(cb, ctx) {
            var _resolve = void 0;
            callbacks.push(function () {
                if (cb) {
                    try {
                        cb.call(ctx);
                    } catch (e) {}
                } else if (_resolve) {
                    _resolve(ctx);
                }
            });
            if (!pending) {
                pending = true;
                timerFunc();
            }
            // $flow-disable-line
            if (!cb && typeof Promise !== 'undefined') {
                return new Promise(function (resolve, reject) {
                    _resolve = resolve;
                });
            }
        };
    }();

    var falsy;
    var $$skipArray = {
        __ob__: falsy,
        $accessors: falsy,
        $vbthis: falsy,
        $vbsetter: falsy
    };

    var uid = 0;

    /**
     * A dep is an observable that can have multiple
     * directives subscribing to it.
     */

    var Dep = function () {
        function Dep() {
            _classCallCheck(this, Dep);

            this.id = uid++;
            this.subs = [];
        }

        Dep.prototype.addSub = function addSub(sub) {
            this.subs.push(sub);
        };

        Dep.prototype.removeSub = function removeSub(sub) {
            remove(this.subs, sub);
        };

        Dep.prototype.depend = function depend() {
            if (Dep.target) {
                Dep.target.addDep(this);
            }
        };

        Dep.prototype.notify = function notify() {
            // stabilize the subscriber list first
            var subs = this.subs.slice();
            for (var i = 0, l = subs.length; i < l; i++) {
                subs[i].update();
            }
        };

        return Dep;
    }();

    // the current target watcher being evaluated.
    // this is globally unique because there could be only one
    // watcher being evaluated at any time.


    Dep.target = null;
    var targetStack = [];

    function pushTarget(_target) {
        if (Dep.target) targetStack.push(Dep.target);
        Dep.target = _target;
    }

    function popTarget() {
        Dep.target = targetStack.pop();
    }

    var arrayProto = Array.prototype;
    var arrayMethods = [];
    _.each(['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'], function (method) {
        var original = arrayProto[method];
        arrayMethods[method] = function mutator() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            var ob = this.__ob__;
            var inserted = void 0;
            switch (method) {
                case 'push':
                case 'unshift':
                    inserted = args;
                    break;
                case 'splice':
                    inserted = args.slice(2);
                    break;
            }
            if (inserted) inserted = ob.observeArray(inserted);
            switch (method) {
                case 'push':
                case 'unshift':
                    args = inserted;
                    break;
                case 'splice':
                    args = [args[0], args[1]].concat(inserted ? inserted : []);
                    break;
            }
            var result = original.apply(this, args);
            ob.dep.notify();
            return result;
        };
    });

    //如果浏览器不支持ecma262v5的Object.defineProperties或者存在BUG，比如IE8
    //标准浏览器使用__defineGetter__, __defineSetter__实现
    var canHideProperty = true;
    try {
        Object.defineProperty({}, '_', {
            value: 'x'
        });
        delete $$skipArray.$vbsetter;
        delete $$skipArray.$vbthis;
    } catch (e) {
        /* istanbul ignore next*/
        canHideProperty = false;
    }

    var createViewModel = Object.defineProperties;
    var defineProperty = void 0;

    var timeBucket = new Date() - 0;
    /* istanbul ignore if*/
    if (!canHideProperty) {
        if ('__defineGetter__' in {}) {
            defineProperty = function defineProperty(obj, prop, desc) {
                if ('value' in desc) {
                    obj[prop] = desc.value;
                }
                if ('get' in desc) {
                    obj.__defineGetter__(prop, desc.get);
                }
                if ('set' in desc) {
                    obj.__defineSetter__(prop, desc.set);
                }
                return obj;
            };
            createViewModel = function createViewModel(obj, descs) {
                for (var prop in descs) {
                    if (descs.hasOwnProperty(prop)) {
                        defineProperty(obj, prop, descs[prop]);
                    }
                }
                return obj;
            };
        }
        /* istanbul ignore if*/
        if (isIE9Below) {
            var VBClassPool = {};
            window.execScript([// jshint ignore:line
            'Function parseVB(code)', '\tExecuteGlobal(code)', 'End Function' //转换一段文本为VB代码
            ].join('\n'), 'VBScript');

            var VBMediator = function VBMediator(instance, accessors, name, value) {
                // jshint ignore:line
                var accessor = accessors[name];
                if (arguments.length === 4) {
                    accessor.set.call(instance, value);
                } else {
                    return accessor.get.call(instance);
                }
            };
            createViewModel = function createViewModel(name, accessors, properties) {
                // jshint ignore:line
                var buffer = [];
                buffer.push('\tPrivate [$vbsetter]', '\tPublic  [$accessors]', '\tPublic Default Function [$vbthis](ac' + timeBucket + ', s' + timeBucket + ')', '\t\tSet  [$accessors] = ac' + timeBucket + ': set [$vbsetter] = s' + timeBucket, '\t\tSet  [$vbthis]    = Me', //链式调用
                '\tEnd Function');
                //添加普通属性,因为VBScript对象不能像JS那样随意增删属性，必须在这里预先定义好
                var uniq = {
                    $vbthis: true,
                    $vbsetter: true,
                    $accessors: true
                };
                for (name in $$skipArray) {
                    if (!uniq[name]) {
                        buffer.push('\tPublic [' + name + ']');
                        uniq[name] = true;
                    }
                }
                //添加访问器属性 
                for (name in accessors) {
                    if (uniq[name]) {
                        continue;
                    }
                    uniq[name] = true;
                    buffer.push(
                    //由于不知对方会传入什么,因此set, let都用上
                    '\tPublic Property Let [' + name + '](val' + timeBucket + ')', //setter
                    '\t\tCall [$vbsetter](Me, [$accessors], "' + name + '", val' + timeBucket + ')', '\tEnd Property', '\tPublic Property Set [' + name + '](val' + timeBucket + ')', //setter
                    '\t\tCall [$vbsetter](Me, [$accessors], "' + name + '", val' + timeBucket + ')', '\tEnd Property', '\tPublic Property Get [' + name + ']', //getter
                    '\tOn Error Resume Next', //必须优先使用set语句,否则它会误将数组当字符串返回
                    '\t\tSet[' + name + '] = [$vbsetter](Me, [$accessors],"' + name + '")', '\tIf Err.Number <> 0 Then', '\t\t[' + name + '] = [$vbsetter](Me, [$accessors],"' + name + '")', '\tEnd If', '\tOn Error Goto 0', '\tEnd Property');
                }

                for (name in properties) {
                    if (!uniq[name]) {
                        uniq[name] = true;
                        buffer.push('\tPublic [' + name + ']');
                    }
                }

                buffer.push('\tPublic [hasOwnProperty]');
                buffer.push('End Class');
                var body = buffer.join('\r\n');
                var className = VBClassPool[body];
                if (!className) {
                    className = makeHashCode('VBClass');
                    window.parseVB('Class ' + className + body);
                    window.parseVB(['Function ' + className + 'Factory(acc, vbm)', //创建实例并传入两个关键的参数
                    '\tDim o', '\tSet o = (New ' + className + ')(acc, vbm)', '\tSet ' + className + 'Factory = o', 'End Function'].join('\r\n'));
                    VBClassPool[body] = className;
                }
                var ret = window[className + 'Factory'](accessors, VBMediator); //得到其产品
                return ret; //得到其产品
            };
        }
    }

    var createViewModel$1 = createViewModel;

    var arrayKeys = _.keys(arrayMethods);

    var observerState = {
        shouldConvert: true
    };

    /**
     * Observer class that are attached to each observed
     * object. Once attached, the observer converts target
     * object's property keys into getter/setters that
     * collect dependencies and dispatches updates.
     */

    var Observer = function () {
        function Observer(value) {
            _classCallCheck(this, Observer);

            this.value = value;
            this.dep = new Dep();
            this.vmCount = 0;
            if (_.isArray(value)) {
                var augment = hasProto ? protoAugment : copyAugment;
                augment(value, arrayMethods, arrayKeys);
                this.model = this.observeArray(value);
            } else {
                this.model = this.walk(value);
            }
            this.model['__ob__'] = this;
        }

        Observer.prototype.walk = function walk(obj) {
            return defineReactive(obj);
        };

        Observer.prototype.observeArray = function observeArray(items) {
            for (var i = 0, l = items.length; i < l; i++) {
                items[i] = observe(items[i]).model;
            }
            return items;
        };

        return Observer;
    }();

    function protoAugment(target, src, keys) {
        /* eslint-disable no-proto */
        target.__proto__ = src;
        /* eslint-enable no-proto */
    }

    /* istanbul ignore next */
    function copyAugment(target, src, keys) {
        for (var i = 0, l = keys.length; i < l; i++) {
            var key = keys[i];
            target[key] = src[key];
        }
    }

    function observe(value, asRootData) {
        if (!_.isObject(value)) {
            return;
        }
        var ob = void 0;
        if (_.has(value, '__ob__') && value.__ob__ instanceof Observer) {
            ob = value.__ob__;
        } else if (observerState.shouldConvert && (_.isArray(value) || isPlainObject(value)) && !value._isVue) {
            ob = new Observer(value);
        }
        if (asRootData && ob) {
            ob.vmCount++;
        }
        return ob;
    }

    function defineReactive(obj, shallow) {

        var props = {};
        _.each(obj, function (val, key) {
            if (key in $$skipArray) {
                return;
            }
            var dep = new Dep();
            var childOb = !shallow && observe(val);
            props[key] = {
                enumerable: true,
                configurable: true,
                get: function reactiveGetter() {
                    var value = val;
                    if (Dep.target) {
                        dep.depend();
                        if (childOb) {
                            childOb.dep.depend();
                            if (_.isArray(value)) {
                                dependArray(value);
                            }
                        }
                    }
                    return value;
                },
                set: function reactiveSetter(newVal) {
                    var value = val;
                    if (newVal === value || newVal !== newVal && value !== value) {
                        return;
                    }
                    val = newVal;
                    childOb = !shallow && observe(newVal);
                    obj[key] = childOb ? childOb.model : newVal;
                    dep.notify();
                }
            };
        });
        return createViewModel$1(obj, props);
    }

    /**
     * Set a property on an object. Adds the new property and
     * triggers change notification if the property doesn't
     * already exist.
     */
    function set(target, key, val) {
        if (_.isArray(target)) {
            target.length = Math.max(target.length, key);
            target.splice(key, 1, val);
            return val;
        }
        if (_.has(target, key)) {
            target[key] = val;
            return val;
        }
        var ob = target.__ob__;
        if (target._isVue || ob && ob.vmCount) {
            return val;
        }
        if (!ob) {
            target[key] = val;
            return val;
        }
        defineReactive(ob.value, key, val);
        ob.dep.notify();
        return val;
    }

    /**
     * Delete a property and trigger change if necessary.
     */
    function del(target, key) {
        if (_.isArray(target)) {
            target.splice(key, 1);
            return;
        }
        var ob = target.__ob__;
        if (target._isVue || ob && ob.vmCount) {
            return;
        }
        if (!_.has(target, key)) {
            return;
        }
        delete target[key];
        if (!ob) {
            return;
        }
        ob.dep.notify();
    }

    /**
     * Collect dependencies on array elements when the array is touched, since
     * we cannot intercept array element access like property getters.
     */
    function dependArray(value) {
        for (var e, i = 0, l = value.length; i < l; i++) {
            e = value[i];
            e && e.__ob__ && e.__ob__.dep.depend();
            if (_.isArray(e)) {
                dependArray(e);
            }
        }
    }

    var queue = [];
    var activatedChildren = [];
    var has = {};
    var waiting = false;
    var flushing = false;
    var index = 0;

    function resetSchedulerState() {
        index = queue.length = activatedChildren.length = 0;
        has = {};
        waiting = flushing = false;
    }

    function flushSchedulerQueue() {
        flushing = true;
        var watcher = void 0,
            id = void 0;

        // Sort queue before flush.
        // This ensures that:
        // 1. Components are updated from parent to child. (because parent is always
        //    created before the child)
        // 2. A component's user watchers are run before its render watcher (because
        //    user watchers are created before the render watcher)
        // 3. If a component is destroyed during a parent component's watcher run,
        //    its watchers can be skipped.
        queue.sort(function (a, b) {
            return a.id - b.id;
        });

        // do not cache length because more watchers might be pushed
        // as we run existing watchers
        for (index = 0; index < queue.length; index++) {
            watcher = queue[index];
            id = watcher.id;
            has[id] = null;
            watcher.run();
        }

        resetSchedulerState();
    }

    function queueWatcher(watcher) {
        var id = watcher.id;
        if (has[id] == null) {
            has[id] = true;
            if (!flushing) {
                queue.push(watcher);
            } else {
                // if already flushing, splice the watcher based on its id
                // if already past its id, it will be run next immediately.
                var i = queue.length - 1;
                while (i > index && queue[i].id > watcher.id) {
                    i--;
                }
                queue.splice(i + 1, 0, watcher);
            }
            // queue the flush
            if (!waiting) {
                waiting = true;
                nextTick(flushSchedulerQueue);
            }
        }
    }

    var uid$1 = 0;

    var Watcher = function () {
        function Watcher(vm, expOrFn, cb, options) {
            _classCallCheck(this, Watcher);

            this.vm = vm;
            // vm._watchers || (vm._watchers = [])
            // vm._watchers.push(this)
            // options
            if (options) {
                this.deep = !!options.deep;
                this.user = !!options.user;
                this.lazy = !!options.lazy;
                this.sync = !!options.sync;
            } else {
                this.deep = this.user = this.lazy = this.sync = false;
            }
            this.cb = cb;
            this.id = ++uid$1; // uid for batching
            this.active = true;
            this.dirty = this.lazy; // for lazy watchers
            this.deps = [];
            this.newDeps = [];
            this.depIds = new Set();
            this.newDepIds = new Set();
            this.expression = '';
            // parse expression for getter
            if (typeof expOrFn === 'function') {
                this.getter = expOrFn;
            } else {
                this.getter = parsePath(expOrFn);
                if (!this.getter) {
                    this.getter = function () {};
                }
            }
            this.value = this.lazy ? undefined : this.get();
        }

        Watcher.prototype.get = function get() {
            pushTarget(this);
            var value = void 0;
            var vm = this.vm;
            try {
                value = this.getter.call(vm, vm);
            } catch (e) {
                if (this.user) {} else {
                    throw e;
                }
            } finally {
                // "touch" every property so they are all tracked as
                // dependencies for deep watching
                if (this.deep) {
                    traverse(value);
                }
                popTarget();
                this.cleanupDeps();
            }
            return value;
        };

        Watcher.prototype.addDep = function addDep(dep) {
            var id = dep.id;
            if (!this.newDepIds.has(id)) {
                this.newDepIds.add(id);
                this.newDeps.push(dep);
                if (!this.depIds.has(id)) {
                    dep.addSub(this);
                }
            }
        };

        Watcher.prototype.cleanupDeps = function cleanupDeps() {
            var i = this.deps.length;
            while (i--) {
                var dep = this.deps[i];
                if (!this.newDepIds.has(dep.id)) {
                    dep.removeSub(this);
                }
            }
            var tmp = this.depIds;
            this.depIds = this.newDepIds;
            this.newDepIds = tmp;
            this.newDepIds.clear();
            tmp = this.deps;
            this.deps = this.newDeps;
            this.newDeps = tmp;
            this.newDeps.length = 0;
        };

        Watcher.prototype.update = function update() {
            /* istanbul ignore else */
            if (this.lazy) {
                this.dirty = true;
            } else if (this.sync) {
                this.run();
            } else {
                queueWatcher(this);
            }
        };

        Watcher.prototype.run = function run() {
            if (this.active) {
                var value = this.get();
                if (value !== this.value ||
                // Deep watchers and watchers on Object/Arrays should fire even
                // when the value is the same, because the value may
                // have mutated.
                _.isObject(value) || this.deep) {
                    // set new value
                    var oldValue = this.value;
                    this.value = value;
                    if (this.user) {
                        try {
                            this.cb.call(this.vm, value, oldValue);
                        } catch (e) {}
                    } else {
                        this.cb.call(this.vm, value, oldValue);
                    }
                }
            }
        };

        Watcher.prototype.evaluate = function evaluate() {
            this.value = this.get();
            this.dirty = false;
        };

        Watcher.prototype.depend = function depend() {
            var i = this.deps.length;
            while (i--) {
                this.deps[i].depend();
            }
        };

        Watcher.prototype.teardown = function teardown() {
            if (this.active) {
                // remove self from vm's watcher list
                // this is a somewhat expensive operation so we skip it
                // if the vm is being destroyed.
                if (!this.vm._isBeingDestroyed) {
                    remove(this.vm._watchers, this);
                }
                var i = this.deps.length;
                while (i--) {
                    this.deps[i].removeSub(this);
                }
                this.active = false;
            }
        };

        return Watcher;
    }();

    var seenObjects = new Set();

    function traverse(val) {
        seenObjects.clear();
        _traverse(val, seenObjects);
    }

    function _traverse(val, seen) {
        var i = void 0,
            keys = void 0;
        var isA = _.isArray(val);
        if (!isA && !_.isObject(val)) {
            return;
        }
        if (val.__ob__) {
            var depId = val.__ob__.dep.id;
            if (seen.has(depId)) {
                return;
            }
            seen.add(depId);
        }
        if (isA) {
            i = val.length;
            while (i--) {
                _traverse(val[i], seen);
            }
        } else {
            keys = _.keys(val);
            i = keys.length;
            while (i--) {
                _traverse(val[keys[i]], seen);
            }
        }
    }

    var computedWatcherOptions = { lazy: true };

    function initComputed(vm, computed) {
        var watchers = vm._computedWatchers = {};

        defineComputed(vm, computed);

        for (var key in computed) {
            var userDef = computed[key],
                context = vm.$$model ? vm.model : vm;
            var getter = typeof userDef === 'function' ? _.bind(userDef, context) : _.bind(userDef.get, context);

            watchers[key] = new Watcher(vm.$$computed, getter || noop, noop, computedWatcherOptions);
        }
    }

    function defineComputed(target, computed) {
        var props = {};
        var shouldCache = true;
        for (var key in computed) {
            if (!(key in target)) {
                var sharedPropertyDefinition = {
                    enumerable: true,
                    configurable: true,
                    get: noop,
                    set: noop
                };
                var userDef = computed[key];
                if (typeof userDef === 'function') {
                    sharedPropertyDefinition.get = createComputedGetter(target, key);
                    sharedPropertyDefinition.set = noop;
                } else {
                    sharedPropertyDefinition.get = userDef.get ? shouldCache && userDef.cache !== false ? createComputedGetter(key) : userDef.get : noop;
                    sharedPropertyDefinition.set = userDef.set ? userDef.set : noop;
                }

                props[key] = sharedPropertyDefinition;
            }
        }
        target.$$computed = createViewModel$1({}, props);
    }

    function createComputedGetter(vm, key) {
        return function computedGetter() {
            var watcher = vm._computedWatchers && vm._computedWatchers[key];
            if (watcher) {
                if (watcher.dirty) {
                    watcher.evaluate();
                }
                if (Dep.target) {
                    watcher.depend();
                }
                return watcher.value;
            }
        };
    }

    function initMethods(vm, methods) {
        for (var key in methods) {
            vm[key] = methods[key] == null ? noop : _.bind(methods[key], vm.$$model ? vm.model : vm);
        }
    }

    function createWatcher(vm, keyOrFn, handler, options) {
        if (isPlainObject(handler)) {
            options = handler;
            handler = handler.handler;
        }
        if (typeof handler === 'string') {
            handler = vm[handler];
        }
        return vm.$watch(keyOrFn, handler, options);
    }

    var VM = function () {
        function VM(model) {
            _classCallCheck(this, VM);

            var vm = this;
            if (model instanceof Observer || model instanceof VM) {
                model = model.model;
            }
            if (_.has(model, '__ob__')) {
                this.$$model = model;
            } else {
                this.options = model || {};
            }
            var keys = _.keys(this.$$model).concat(_.keys(this.computed));
            var props = {};

            var _loop = function _loop(i, len) {
                var key = keys[i];
                if (!(key in $$skipArray)) {
                    props[key] = {
                        enumerable: true,
                        configurable: true,
                        get: function get() {
                            return key in vm.$$computed ? vm.$$computed[key] : vm.$$model[key];
                        },
                        set: function set(val) {
                            if (!vm.$$model || !(key in vm.$$model)) {
                                return;
                            }
                            return vm.$$model[key] = val;
                        }
                    };
                }
            };

            for (var i = 0, len = keys.length; i < len; i++) {
                _loop(i, len);
            }
            this.model = createViewModel$1({}, props);
            this.$$model && (this.model.__ob__ = this.$$model.__ob__);
            initComputed(this, this.computed);
            initMethods(this, this.methods);
            this._init();
        }

        VM.prototype.$watch = function $watch(expOrFn, cb, options) {
            var vm = this;
            if (isPlainObject(cb)) {
                return createWatcher(vm, expOrFn, cb, options);
            }
            options = options || {};
            options.user = true;
            var watcher = new Watcher(vm.model, expOrFn, _.bind(cb, vm), options);
            if (options.immediate) {
                cb.call(vm, watcher.value);
            }
            return function unwatchFn() {
                watcher.teardown();
            };
        };

        VM.prototype._init = function _init() {};

        VM.prototype.destroy = function destroy() {
            for (var _key2 in this._computedWatchers) {
                this._computedWatchers[_key2].teardown();
            }
        };

        return VM;
    }();

    function define(model) {
        return new Observer(model).model;
    }
    var version = '2.0';

    exports.define = define;
    exports.version = version;
    exports.$$skipArray = $$skipArray;
    exports.VM = VM;
    exports.observerState = observerState;
    exports.Observer = Observer;
    exports.observe = observe;
    exports.defineReactive = defineReactive;
    exports.set = set;
    exports.del = del;
    exports.Watcher = Watcher;

    exports.__esModule = true;
});