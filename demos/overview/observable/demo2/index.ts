function foo() {
    console.log('Hello');
    return 42;
}

// @ts-ignore
const x = foo.call(); // 与foo()一样
console.log(x);
// @ts-ignore
const y = foo.call(); // 与foo()一样
console.log(y);