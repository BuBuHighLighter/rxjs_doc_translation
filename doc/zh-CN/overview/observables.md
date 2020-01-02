# 第一部分——Observable

可观察对象是多值惰性Push集合(原文: Observables are lazy Push collections of multiple values)。它们填补了下表中的缺失点:

|-|Single|Multiple|
|-|-|-|
|Pull|Function|Iterator|
|Push|Promise|Observable|

举个例子。以下是一个Observable，它在订阅时立即（同步）推送值1、2、3，并且自订阅调用起经过一秒钟后，值4便完成了:

```ts
import { Observable } from 'rxjs';

const observable = new Observable(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  setTimeout(() => {
    subscriber.next(4);
    subscriber.complete();
  }, 1000);
});
```

要调用Observable并查看这些值，我们需要订阅它:

```ts
import { Observable } from 'rxjs';
 
const observable = new Observable(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  setTimeout(() => {
    subscriber.next(4);
    subscriber.complete();
  }, 1000);
});
 
console.log('just before subscribe');
observable.subscribe({
  next(x) { console.log('got value ' + x); },
  error(err) { console.error('something wrong occurred: ' + err); },
  complete() { console.log('done'); }
});
console.log('just after subscribe');
```

在控制台上这样执行:

```bash
just before subscribe
got value 1
got value 2
got value 3
just after subscribe
got value 4
done
```

## 一、Pull(拉)与Push(推)

*Pull*与*Push*是两种不同的协议，它们描述了数据生产者如何与数据使用者通信。

什么是*Pull*？在*Pull*系统中，使用者确定何时从数据生产者接收数据。生产者本身并不知道何时将数据发送给消费者。

每个JavaScript函数都是一个*Pull*系统。 该函数是数据的生产者，并且调用该函数的代码通过从调用中“拉出(Pulling)”单个返回值来使用它。

ES2015引入了[生成器函数和迭代器](#)（`function *`），这是另一种*Pull*系统。 调用`iterator.next()`的代码是使用者，它从迭代器（生产者）中“拉出(Pulling)”多个值。

|-|生产者|消费者|
|-|-|-|
|Pull|被动: 在需要时产生数据。|主动: 决定何时请求数据。|
|Push|主动: 以自己的速度生成数据。|被动: 对收到的数据做出反应。|

什么是*Push*？在*Push*系统中，生产者确定何时将数据发送给消费者。消费者不知道何时接收该数据。

Promise是当今JavaScript中最常见的*Push*类型的系统。Promise（生产者）将已解析的值传递给注册的回调（消费者），但与函数不同，Promise负责精确确定何时将该值“推送”到回调中。

RxJS引入了`Observables`，这是一个用于JavaScript的新Push系统。 一个`Observable`是**多个**值的生产者，将它们“推送(Pushing)”到观察者（消费者）。

- 函数是惰性计算，在调用时会同步返回单个值。（原文: A Function is a lazily evaluated computation that synchronously returns a single value on invocation.）
- 生成器是一种延迟计算，在迭代时会同步返回从零到（潜在的）无限个值。（原文: A generator is a lazily evaluated computation that synchronously returns zero to (potentially) infinite values on iteration.）
- Promise是一种最终可能会（也可能不会）返回单个值的计算。（原文: A Promise is a computation that may (or may not) eventually return a single value.）
- Observable是一种延迟计算，从调用开始起，它可以同步或异步地返回从零到（潜在的）无限个值。

## 二、Observables作为一般函数

(标题原文: Observables as generalizations of functions)

与流行的说法相反，Observables(可观察对象)不像EventEmitters，也不像是多个值的Promises。 在某些情况下，Observables的行为可能类似于EventEmitters，即当使用RxJS的`Subjects`对Observables进行多播时，但是通常它们并不类似于EventEmitters。

> Observables就像没有参数的函数，但是将其概括化以允许多个值。（原文: Observables are like functions with zero arguments, but generalize those to allow multiple values.）

思考以下代码:

[代码示例](../../../demos/overview/observable/demo2/index.ts)
```ts
function foo() {
  console.log('Hello');
  return 42;
}

const x = foo.call(); // 与foo()一样
console.log(x);
const y = foo.call(); // 与foo()一样
console.log(y);
```

我们期望的输出结果:

```bash
"Hello"
42
"Hello"
42
```

您可以使用Observables编写与上面相同的行为:

[代码示例](../../../demos/overview/observable/demo3/index.ts)
```ts
import { Observable } from 'rxjs';
 
const foo = new Observable(subscriber => {
  console.log('Hello');
  subscriber.next(42);
});
 
foo.subscribe(x => {
  console.log(x);
});
foo.subscribe(y => {
  console.log(y);
});
```

输出是一样的:

```bash
"Hello"
42
"Hello"
42
```

产生这种结果是因为函数和Observables都是惰性计算。如果不调用该函数，则`console.log('Hello')`不会执行。 同样在Observables中，如果您不“调用”它（使用`subscribe`），则`console.log('Hello')`不会执行。 另外，“调用(calling)”或“订阅(subscribing)”是一个独立的操作：两个函数调用触发两个单独的副作用，两个Observable订阅触发两个单独的副作用。 与EventEmitters具有副作用并且不管订阅者的存在如何都渴望执行相比，Observables没有共享执行并且很懒。

> 订阅(subscribing)一个`Observable`类似于调用一个Function。

有人声称Observable是异步的，那是不对的。如果在函数调用中打印日志，如下所示：

```ts
console.log('before');
console.log(foo.call());
console.log('after');
```

你会看到这样的输出:

```bash
"before"
"Hello"
42
"after"
```

使用Observables实现与上面相同功能:

[代码示例](../../../demos/overview/observable/demo4/index.ts)
```ts
console.log('before');
foo.subscribe(x => {
  console.log(x);
});
console.log('after');
```

输出是这样:

```bash
"before"
"Hello"
42
"after"
```

这证明foo的订阅是完全同步的，就像一个函数一样。

> Observables能够同步或异步传递值。

一个Observable和一个函数有什么区别？ 观察对象可以随着时间的推移“返回”多个值，而某些函数则无法实现。例如，您不能这样做：

```ts
function foo() {
  console.log('Hello');
  return 42;
  return 100; // dead code. will never happen
}
```

函数只能返回一个值。但是，Observables可以做到这一点：

[代码示例](../../../demos/overview/observable/demo5/index.ts)
```ts
import { Observable } from 'rxjs';
 
const foo = new Observable(subscriber => {
  console.log('Hello');
  subscriber.next(42);
  subscriber.next(100); // "return" another value
  subscriber.next(200); // "return" yet another
});
 
console.log('before');
foo.subscribe(x => {
  console.log(x);
});
console.log('after');
```

同步输出:

```bash
"before"
"Hello"
42
100
200
"after"
```

而且您也可以“异步”返回值:

[代码示例](../../../demos/overview/observable/demo6/index.ts)
```ts
import { Observable } from 'rxjs';
 
const foo = new Observable(subscriber => {
  console.log('Hello');
  subscriber.next(42);
  subscriber.next(100);
  subscriber.next(200);
  setTimeout(() => {
    subscriber.next(300); // happens asynchronously
  }, 1000);
});
 
console.log('before');
foo.subscribe(x => {
  console.log(x);
});
console.log('after');
```

会输出:

```bash
"before"
"Hello"
42
100
200
"after"
300
```

**结论:**

- `func.call()`意思是“同步给我一个值”
- `observable.subscribe()`意思是“给我任何数量的值，无论是同步还是异步”

## 三、剖析一个Observable

Observables使用`new Observable`或者一个创建Observable的操作符来进行创建。可以使用一个`Observer`进行订阅，执行Observable以便将`next`、`error`、`complete`通知传递给`Observer`，并且他们的执行是对外可见的。（原文：Observables are created using new Observable or a creation operator, are subscribed to with an Observer, execute to deliver next / error / complete notifications to the Observer, and their execution may be disposed.）

这四个方面都在`Observable`实例中进行编码，但是其中一些方面与其他类型（如Observer和Subscription）有关。

Observable的核心关系:

- 创建Observables
- 订阅Observables
- 执行Observables
- 处理Observables

### 3.1 创建Observables

`Observable`构造函数接收一个参数：subscribe(订阅)函数。

下面的示例创建一个Observable，以每秒向订阅者发出字符串“hi”。

```ts
import { Observable } from 'rxjs';

const observable = new Observable(function subscribe(subscriber) {
  const id = setInterval(() => {
    subscriber.next('hi')
  }, 1000);
});
```

> Observables可以使用`new Observable`创建。通常，Observables使用创建函数创建，例如`of`、`from`、`interval`等。

在上面的示例中，subscribe(订阅)函数是描述Observable的最重要部分。现在让我们看看订阅的含义。

### 3.2 订阅Observables

可以订阅示例中的`Observable`，如下所示：

```ts
observable.subscribe(x => console.log(x));
```

`observable.subscribe`和`subscribe`在`new Observable(function subscribe(subscriber) {...})`中具有相同名字并不是巧合。（原文：It is not a coincidence that observable.subscribe and subscribe in new Observable(function subscribe(subscriber) {...}) have the same name.）

在库中，它们是不同的，但是出于实际目的，您可以在概念上将它们视为相等。

这显示了如何在同一可观察对象的多个观察者之间不共享订阅调用。（原文：This shows how subscribe calls are not shared among multiple Observers of the same Observable.）

当使用`Observer`调用`observable.subscribe`时，`new Observable(function subscribe(subscriber) {...})`中的`subscribe`函数为给定的订阅者运行。每次对`observable.subscribe`的调用都会为给定的订阅者触发自己的独立设置。【原文： When calling observable.subscribe with an Observer, the function subscribe in new Observable(function subscribe(subscriber) {...}) is run for that given subscriber. Each call to observable.subscribe triggers its own independent setup for that given subscriber.】

> 订阅Observable就像调用一个函数，提供传递数据的回调函数。

这与事件处理程序API（例如`addEventListener`/`removeEventListener`）完全不同。`使用observable.subscribe`，给定的Observer不会在Observable中注册为一个侦听器。Observable甚至不会为隶属于其的Observers维护一个列表。

调用`subscribe`只是启动“执行Observable”并将值或事件传递给该执行的观察者（Observer）的一种方式。

### 3.3 执行Observables

在`new Observable(function subscribe(subscriber) {...})`中的代码表示“执行Observable”，这是一种惰性计算，仅对每个订阅的Observer发生。执行会随时间推移同步或异步地生成多个值。

执行Observable可以提供三种类型的值：

- “Next”通知：发送一个值，例如数字（number）、字符串（string）、对象（object）等等。
- “Error”通知：发送一个JavaScript Error或一个exception。
- “Complete”通知：不发送值。

“Next”通知是最重要也是最频繁使用的一类：它们代表正在交付给订阅者的实际数据。“Error”和“Complete”通知在Observable执行的过程中可能只发生一次，而且只能是其中之一发生。

这些约束作为正则表达式编写可以在所谓的Observable语法或契约中最好得体现出来。【原文：These constraints are expressed best in the so-called Observable Grammar or Contract, written as a regular expression】

```ts
next*(error|complete)?
```

> 在Observable的执行中，可能会传递零到无限个Next通知。一旦有传递了错误（Error）或完成（Complete）通知，则此后将无法传递其他任何东西。

以下是Observable执行的示例，该示例传递三个Next通知，然后完成：

```ts
import { Observable } from 'rxjs';

const observable = new Observable(function subscribe(subscriber) {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
});
```

Observable严格遵守Observable Contract，因此以下代码不会传递Next通知4：

```ts
import { Observable } from 'rxjs';

const observable = new Observable(function subscribe(subscriber) {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
  subscriber.next(4); // 不会通知，因为违法了约定
});
```

最好将在`subscribe`中的任何代码包装在`try`/`catch`中，如果捕获到异常，它将发出错误通知：

```ts
import { Observable } from 'rxjs';
 
const observable = new Observable(function subscribe(subscriber) {
  try {
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    subscriber.complete();
  } catch (err) {
    subscriber.error(err); // 一旦捕获错误就发出错误通知
  }
});
```

### 3.4 处理Observable的执行

因为Observable的执行可能是无限的，并且Observer（观察者）想在有限的时间内终止执行是很常见的，所以我们需要一个API来取消执行。由于每次执行仅对一个Observer专有，因此一旦Observer完成接收值，它就必须有一种停止执行的方式，以避免浪费计算能力或内存资源。

当调用`observable.subscribe`时，Observer将关联到新创建的Observable执行中。 此调用还返回一个对象，即`Subscription`：

```ts
const subscription = observable.subscribe(x => console.log(x));
```

Subscription表示正在进行的执行，并且具有最小的API，可让您取消该执行。点击此处阅读更多关于[订阅类型](#)的信息。使用`subscription.unsubscribe()`可以取消正在进行的执行：

```ts
import { from } from 'rxjs';

const observable = from([10, 20, 30]);
const subscription = observable.subscribe(x => console.log(x));
// Later:
subscription.unsubscribe();
```

> 订阅后，您将获得一个*Subscription*，代表正在进行的执行。只需调用*unsubscribe()*即可取消执行。

当我们使用`create()`创建Observable时，每个Observable必须定义如何处置该执行的Observable的资源。您可以通过从subscribe()函数中返回一个自定义的`unsubscribe`函数来实现。

例如，这是我们使用setInterval清除间隔执行集的方式：

```ts
const observable = new Observable(function subscribe(subscriber) {
  // 跟踪间隔资源
  const intervalId = setInterval(() => {
    subscriber.next('hi');
  }, 1000);

  // 提供一种取消和配置间隔资源的方法
  return function unsubscribe() {
    clearInterval(intervalId);
  };
});
```

就像`observable.subscribe`类似于`new Observable(function subscribe() {...})`那样，我们从subscription返回的`unsubscribe`在概念上也等于`subscription.unsubscribe`。实际上，如果删除围绕这些概念的ReactiveX类型，则会剩下相当简单的JavaScript。

```ts
function subscribe(subscriber) {
  const intervalId = setInterval(() => {
    subscriber.next('hi');
  }, 1000);
 
  return function unsubscribe() {
    clearInterval(intervalId);
  };
}
 
const unsubscribe = subscribe({next: (x) => console.log(x)});
 
// Later:
unsubscribe(); // 处置资源
```

之所以使用诸如Observable，Observer和Subscription之类的Rx类型，是为了获得与运算符的安全性（例如Observable Contract）和可组合性。

