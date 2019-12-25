# 概述

## 简介

Rxjs是一个通过使用`observable`序列来组成异步和基于事件的程序的库。它提供了一个核心类型，即`Observable`,附属类型(`Observer`, `Schedulers`, `Subjects`)和受[Array#extras](#)启发的运算符(`map`, `filter`, `reduce`, `every`……)，以将异步事件作为集合进行处理。

> 将RxJS视为事件的Lodash

ReactiveX将[Observer模式](#)和[Iterator模式](#)以及[具有集合的函数式编程](#)相结合，从而实现了一种管理事件序列的理想方式。

RxJS中解决异步事件管理的基本概念是：

- Observable: 指代可调用的将来的值或事件
- `Observer`: 是一个知道如何监听`Observable`传递的值的回调集合。
- `Subscription`(订阅): 代表`Observable`的执行，主要用于取消执行。
- `Operators`: 是纯函数，可以通过函数式编程样式来处理具有`map`，`filter`，`concat`，`reduce`等操作的集合。
- `Subject`: 是等效于EventEmitter的方法，并且是将值或事件多播到多个观察者的唯一方法。
- `Schedulers`(调度器): 是用于控制并发性的集中式调度程序，当出现例如 setTimeout或requestAnimationFrame或其他情况时，允许我们能够协调。（原文：Schedulers: are centralized dispatchers to control concurrency, allowing us to coordinate when computation happens on e.g. setTimeout or requestAnimationFrame or others.）

## 第一个例子

通常，你注册事件监听器：

```js
document.addEventListener('click', () => console.log('Clicked!'));
```

使用RxJS创建一个可观察的对象:

```ts
import { fromEvent } from 'rxjs';

fromEvent(document, 'click').subscribe(() => console.log('Clicked!'));
```

### 纯净(Purity)

使RxJS强大的原因是因为它具有使用纯净函数生成值的能力。 这意味着您的代码不太容易出错。

通常，您会创建一个不纯净的函数，其他代码段可能会使您的状态混乱。

```ts
let count = 0;
document.addEventListener('click', () => console.log(`Clicked ${++count} times`));
```

使用RxJS可以隔离状态。

```ts
import { fromEvent } from 'rxjs';
import { scan } from 'rxjs/operators';

fromEvent(document, 'click')
  .pipe(scan(count => count + 1, 0))
  .subscribe(count => console.log(`Clicked ${count} times`));
```

`scan`操作符的作用就像数组中的`reduce`。它获取一个暴露给回调函数的值。回调函数的返回值将成为下次运行回调函数时暴露的下一个值。（原文：The scan operator works just like reduce for arrays. It takes a value which is exposed to a callback. The returned value of the callback will then become the next value exposed the next time the callback runs.）

### 流

RxJS具有各种运算符，可帮助您控制通过可观察对象(observables)的事件流。

这是使用普通JavaScript允许每秒最多点击一次的方式：

```ts
let count = 0;
let rate = 1000;
let lastClick = Date.now() - rate;
document.addEventListener('click', () => {
  if (Date.now() - lastClick >= rate) {
    console.log(`Clicked ${++count} times`);
    lastClick = Date.now();
  }
});
```

使用rxjs改写:

```ts
import { fromEvent } from 'rxjs';
import { throttleTime, scan } from 'rxjs/operators';

fromEvent(document, 'click')
  .pipe(
    throttleTime(1000),
    scan(count => count + 1, 0)
  )
  .subscribe(count => console.log(`Clicked ${count} times`));
```

其他的流控制运算符是`filter`, `delay`, `debounceTime`, `take`, `takeUntil`, `distinct`, `distinctUntilChanged`等。

### 值

您可以转换通过可观察对象(observables)传递的值。

以下是使用纯JavaScript为每次点击添加当前鼠标X坐标的方法：

```ts
let count = 0;
const rate = 1000;
let lastClick = Date.now() - rate;
document.addEventListener('click', event => {
  if (Date.now() - lastClick >= rate) {
    count += event.clientX;
    console.log(count);
    lastClick = Date.now();
  }
});
```

使用Rxjs改写:

```ts
import { fromEvent } from 'rxjs';
import { throttleTime, map, scan } from 'rxjs/operators';

fromEvent(document, 'click')
  .pipe(
    throttleTime(1000),
    map(event => event.clientX),
    scan((count, clientX) => count + clientX, 0)
  )
  .subscribe(count => console.log(count));
```

其他提取值的操作符包括：`pluck`, `pairwise`, `sample`等等。

