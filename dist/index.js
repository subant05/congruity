function always(data){
    return function (){
        return data
    }
}

function alt (funcA,funcB){
    return function(data){
        return funcA(data) || funcB(data)
    }
}

function and(){
    return Array
        .from(arguments)
        .filter(item=> typeof item === 'function' ?  Boolean(item()) : Boolean(item) )
        .length === arguments.length;
}

function or(){
    return Array
    .from(arguments)
    .filter(item=> typeof item === 'function' ?  Boolean(item()) : Boolean(item) )
    .length >=1;
}

function curry (fn, args = []) {
    if (args.length === fn.length) 
        return fn.apply(null, args);

    return function partial () {
      return curry(fn, args.concat.apply(args, arguments));
    }
  }

function compose (){
    const args = arguments;
    let count = args.length -1,
        result;

    return function (data){
        let iterator = count;
        if(data)
            result = data;

        do {
            if(typeof args[iterator] != "function")
                continue;

            result = args[iterator](result);
        } while(--iterator >= 0)

        return result;
    }
}

function checkObject(obj){
    return or(typeof obj !== "object", obj instanceof Array) ? null : obj
}

const clone = compose(
    curry(Object.assign, [{}])
    , checkObject
);

function asyncCompose() {
  const args = arguments;
  let count = args.length - 1,
    result;

  return async function (data) {
    let iterator = count;
    if (data) result = data;

    do {
      if (typeof args[iterator] != "function") continue;

      if (
        args[iterator].constructor.prototype[Symbol.toStringTag] ===
        "AsyncFunction"
      )
        result = await args[iterator](result);
      else result = args[iterator](result);
    } while (--iterator >= 0);

    return result;
  };
}

function identity (data){
    console.log("Identity:", data);
    return data;
}

function join (joiner,funcA,funcB){
    return function(data){
        return joiner(funcA(data),funcB(data))
    }
}

function of(value){
    return Array.of(value);
}

function pipe (){
    const args = arguments;
    let count = args.length -1,
        result;

    return function (data){
        let iterator = 0;
        if(data)
            result = data;

        do {
            if(typeof args[iterator] != "function")
                continue;

            result = args[iterator](result);
        } while(++iterator <= count)

        return result;
    }
}

function seq(){
    const fns = arguments;

    return function(data) {
        for(let i = 0, len = fns.length; i < len; i++){
            fns[i](data);
        }

        return data;
    }
}

function tap(report){
    return function (data){
       typeof report === 'function' ? report(data) : console.log(data);
       return data;
    }
}

class Wrapper {
    constructor(value) {
        this._value = value;
    }

    map(fn) {
        return fn(this._value);
    }

    fmap(fn) {
        return new Wrapper(fn(this._value))
    }
}

function wrap(value){
    return new Wrapper(value);
}

/**
 * @module fn
 */

var index$4 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    alt: alt,
    always: always,
    and: and,
    asyncCompose: asyncCompose,
    clone: clone,
    compose: compose,
    curry: curry,
    identity: identity,
    join: join,
    of: of,
    or: or,
    pipe: pipe,
    seq: seq,
    tap: tap,
    wrap: wrap
});

class Maybe {

    static just(value){
        return new Just(value)
    }

    static nothing(){
        return new Nothing()
    }

    static fromNullable(value){
        return  value != null ? Maybe.just(value) : Maybe.nothing()
    }
    
    static of(value){
        return Maybe.just(value)
    }
    
    get just(){
        return false;
    }

    get nothing(){
        return false;
    }
}

class Just extends Maybe{
    
    constructor(value){
        super();
        this._value = value;
    }

    get value(){
        return this._value
    }

    map(fn){
       return Maybe.fromNullable(fn(this._value))
    }

    filter(fn){
        return Maybe.fromNullable(fn(this._value) ? this._value : null)
    }

    chain(fn){
        return fn(this._value)
    }

    getOrElse(){
        return this._value;
    }

    toString() {
        return `Just: ${this._value}`;
    }
}

class Nothing extends Maybe {
    constructor(){
        super();
    }
    map(){
        return this;
    }

    filter(){
        return this;
    }

    chain(){
        return this;
    }

    get(){
        throw new Error("Can not get value of null or Undefined")
    }
    
    getOrElse(other){
        return other
    }

    toString() {
        return `Nothing: null`;
    }
}

class Either {

    get value(){
        return this._value;
    }

    static right(value){
        return new Right(value);
    }

    static left(value){
        return new Left(value);
    }

    static fromNullable(value){
       return  value !== null && typeof value !== "undefined" ? Either.right(value) : Either.left(value);
    }

    static of(value) {
        return Either.right(value);
    }
}

class Left extends Either {
    constructor(value){
        super();
        this._value = value;
    }

    map() {
        return this;
    }

    get value() {
        throw new Error("Can not extract a left value");
    }

    chain(){
        return this;
    }

    getOrElse(other){
        return other;
    }

    getOrElseThrow(other="Error"){
        throw new Error(other);
    }

    orElse(fn){
        return fn(this._value);
    }
    
    filter(){
        return this;
    }

    toString(){
        return `Left: ${this._value}`;
    }
}

class Right extends Either {
    constructor(value){
        super();
        this._value = value;
    }
    
    map(fn){
        return Either.fromNullable(fn(this._value));
    }

    getOrElse(){
        return this._value;
    }
    
    chain(fn) {
        return fn(this._value);
    }

    getOrElseThrow(){
        return this._value;
    }

    orElse(){
        return this;
    }

    filter(fn){
        return Either.fromNullable(fn(this._value) ? this._value : null);
    }
    
    toString(){
        return `Right: ${this._value}`;
    }
}

class IO {
    constructor(action){
        if(typeof action !== 'function')
            throw new Error("functions can only be used with IO")

        this.action = action;
    }

    static of(action){
        return new IO(()=>a)
    }

    static from(fn) {
        return new IO(fn)
    }

    map(fn) {
        const that = this;
    
        return new IO(()=>fn(that.action()))
    }

    chain(fn) {
        return fn(this.action())
    }

    run() {
        return this.action()
    }
}

/**
 * @module monad
 */

var index$3 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Either: Either,
    IO: IO,
    Maybe: Maybe
});

function deccorate(fn,args=[],decoration={}){
    
    function Decorator(){
        fn.apply(this,arguments);
    }    Decorator.prototype = Object.assign(fn.prototype,decoration);

    return new Decorator(...args)
}

function deccorateCurry(fn,decoration={}){

    function Decorator(){
        fn.apply(this,arguments);
    }

    Decorator.prototype = Object.assign(fn.prototype,decoration);

    return function(){
        return new Decorator(...arguments)
    }
}

function factory(fn,args=[]){
    class Func extends fn {}    
    return function() {
        return new Func(...args.concat([...arguments]));
    }
}

function merge(fn=a=>a) {
    const fns = [...arguments],
        executedFns = [];

    function F(){}
    fns.forEach((currFn, index)=>Object.assign(F.prototype,currFn.prototype));
    
    let f = new F;

    function executeFns() {
        if(arguments.length === fns[0].length){

            Object.assign(f,new fns[0](...arguments));
            executedFns.push(fns.shift());

        }
    }

    function R(){
        executeFns(...arguments);
        if(fns.length)
            return R;
        executedFns.length = 0;
        return f;
    }

    return R;
}

function isFillObject(obj){
    return and(obj instanceof Object, Object.keys(obj).length);
}

function iteratorOverMiddleware(middleware, args, finish, index) {
    if(!middleware || !middleware instanceof Array || index === middleware.length)
        return finish && finish(args);
    
    middleware[index].call(this,...args,err=>{
        if(err)
            throw new Error("Error: ", err.message);

        return iteratorOverMiddleware.call(this, middleware, args, finish, ++index);
    });
}

function verifyConfig(config){
    return config && isFillObject(config);
}

function verifyMiddlewareInstance(middlewareInstance){
    return middlewareInstance && typeof middlewareInstance.executeMiddlewares === 'function';
}

function verifySetup(config, middlewareInstance){
    return (or(!verifyConfig(config),!verifyMiddlewareInstance(middlewareInstance))) ? null : middlewareInstance;
}

function removeReservedProperties(config){
    return function(middlewareInstance){
        
        ["use", "executeMiddlewares", "events"].forEach(defaultBehaviors=>delete config.behaviors[defaultBehaviors]);
        return middlewareInstance;
    }
}

function setUpMiddlewareInstance(){
   return {
        events : {}
        , use(middleware){
            if(!isFillObject(middleware)) return;

            for(let ev in middleware){
                if(!(ev in this.events)) {
                    this.events[ev] =[];
                }

                this.events[ev].push(middleware[ev]);
            }
        }
        , executeMiddlewares(middleware,args,finish){
            iteratorOverMiddleware.call(this, middleware, args, finish, 0);
        }
    }
}

function addMiddlewareBehaviors(config){
    return function (middlewareInstance){
        for(let event in config.behaviors)
            for(let behavior in config.behaviors[event]){
                middlewareInstance[behavior] = function() { 

                    const data = [...arguments];
                    const cb = (typeof data[data.length-1] === 'function') ? data.pop() : a=>a;

                    this.executeMiddlewares(this.events[event]
                            , data
                            , (args)=>config.behaviors[event][behavior](...args,cb)
                    );
                        
                };

        }
        return middlewareInstance;
    }
}

function setupMiddlewareBehaviors(config) {
    return function(middlewareInstance){
        return Maybe.fromNullable(verifySetup(config,middlewareInstance))
                .map(removeReservedProperties(config))
                .map(addMiddlewareBehaviors(config))
                .getOrElse(null);

    }
}

function middlewareManager(config){    
    return Maybe.fromNullable(config)
        .map(setUpMiddlewareInstance)
        .map(setupMiddlewareBehaviors(config))
        .getOrElse(null);

}

function proxy(obj={},handler={}){
    handler.set = a=>a;
    return new Proxy(obj, handler)
}

function reveal(fn, hideMethods = []) {
  class Func extends fn {
    constructor(exec) {
      super();

      const revealedMethods = [];

      hideMethods.forEach((m) => {
        revealedMethods.push(this[m].bind(this));
        this[m] = undefined;
      });

      revealedMethods.push((a) => a);

      return exec(...revealedMethods);
    }
  }

  return function (exec) {
    return new Func(exec);
  };
}

/**
 * @module pattern
 */

var index$2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    decorate: deccorate,
    decorateCurry: deccorateCurry,
    factory: factory,
    merge: merge,
    middleware: middlewareManager,
    proxy: proxy,
    reveal: reveal
});

function createObserver(nodeArg, eventArg) {
  const node = nodeArg,
    event = eventArg,
    container = {},
    handlers = [
      [], //next
      [], //error
      [], //complete
    ];

  class Observer {
    constructor(argNode) {
      container.complete = this.complete.bind(this);
      container.next = this.next.bind(this);
      container.error = this.error.bind(this);

      delete this.complete;
      delete this.next;
      delete this.error;
    }

    complete() {
      handlers[2].forEach((fn) => {
        fn(data);
      });

      this.complete = undefined;
    }

    next(data) {
      handlers[0].forEach((fn) => {
        fn(data);
      });
    }

    error(err) {
      handlers[1].forEach((fn) => {
        fn(data);
      });
    }

    pipe() {
      const pipedFn = pipe(...arguments);
      const that = this;
      return {
        subscribe() {
          arguments[0] = compose(arguments[0], pipedFn);
          that.subscribe(...arguments);
        },
      };
    }

    subscribe() {
      [...arguments].forEach((fn, index) => {
        handlers[index].push(fn);
      });
    }

    emit(data, eventArg) {
      const eventInstance = new window.Event(eventArg || event);
      eventInstance.data = data;
      node.dispatchEvent(eventInstance);
    }
  }

  const subscription = new Observer(),
    handler = container;

  return { subscription, handler };
}

function observable(
  handler = (ob) => ob.next(),
  config = { event: "default" }
) {
  const node = config.node || document.createElement("div"),
    event = config.event,
    observer = createObserver(node, event);

  node.addEventListener(
    config.event,
    (e) => handler(observer.handler, e),
    false
  );

  return observer.subscription;
}

function returnArrayFunction(method,fn){
    return function (data){
        return data[method](fn)
    }
}

function map(fn){
    return returnArrayFunction('map',fn)
}

function filter(fn){
    return returnArrayFunction('filter',fn)

}

function find(fn){
    return returnArrayFunction('find',fn)
}

function operator(fn){
    return function (data){
        return fn(data)
    }
}

/**
 * @module reactive
 * */

var index$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    filter: filter,
    find: find,
    map: map,
    observable: observable,
    operator: operator
});

var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    fn: index$4,
    monad: index$3,
    pattern: index$2,
    reactive: index$1
});

export { index as Congruity };
