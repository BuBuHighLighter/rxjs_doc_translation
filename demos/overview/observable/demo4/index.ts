import { Observable } from 'rxjs';
 
const foo = new Observable(subscriber => {
  console.log('Hello');
  subscriber.next(42);
});

console.log('before');
foo.subscribe(x => {
  console.log(x);
});
console.log('after');