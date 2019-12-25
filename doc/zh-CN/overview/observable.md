# Observable

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

## Pull(拉)与Push(推)

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

## Observables作为一般函数

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