export default class Either {
  get value() {
    return this._value;
  }

  static right(value) {
    return new Right(value);
  }

  static left(value) {
    return new Left(value);
  }

  static async fromNullable(value) {
    return value !== null && typeof value !== "undefined"
      ? Either.right(value)
      : Either.left(value);
  }

  static of(value) {
    return Either.right(value);
  }
}

class Left extends Either {
  constructor(value) {
    super();
    this._value = value;
  }

  map() {
    return this;
  }

  async asyncMap() {
    return this;
  }

  get value() {
    throw new Error("Can not extract a left value");
  }

  chain() {
    return this;
  }

  async asyncChain() {
    return this;
  }

  getOrElse(other) {
    return other;
  }

  getOrElseThrow(other = "Error") {
    throw new Error(other);
  }

  orElse(fn) {
    return fn(this._value);
  }

  async asyncOrElse(fn) {
    return await fn(this._value);
  }

  filter() {
    return this;
  }

  toString() {
    return `Left: ${this._value}`;
  }
}

class Right extends Either {
  constructor(value) {
    super();
    this._value = value;
  }

  map(fn) {
    return Either.fromNullable(fn(this._value));
  }

  async asyncMap(fn) {
    return await Either.fromNullable(await fn(this._value));
  }

  getOrElse() {
    return this._value;
  }

  chain(fn) {
    return fn(this._value);
  }

  async asyncChain(fn) {
    return await fn(this._value);
  }

  getOrElseThrow() {
    return this._value;
  }

  orElse() {
    return this;
  }

  async asyncOrElse() {
    return this;
  }

  filter(fn) {
    return Either.fromNullable(fn(this._value) ? this._value : null);
  }

  toString() {
    return `Right: ${this._value}`;
  }
}
