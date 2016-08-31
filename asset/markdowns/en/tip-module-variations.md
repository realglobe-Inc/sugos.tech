## Ways to Declare Actor Modules

There are several ways to declare a module for actor

### new Module(methods)

The most basic way is passing object represents methods

```javascript
const sugoActor = require('sugo-actor')
const {Module} = sugoActor

let module01 = new Module({
  doSomething () { /* ... */ }
})

```

### new Module(func)
 
Methods could be a single functions. 

```javascript
let module02 = new Module(function asFunc () { /* ... */ })
```

The module it self will be a function on caller side.

For more detail, see https://github.com/realglobe-Inc/sugo-actor#declare-a-single-function-as-module


### new (class Custom {} extends Module)()

Actor accepts instances of custom class which extends `Module`. 

```javascript
class CustomModule extends Module {
  doSomething () { /* ... */ }
}
let module03 = new CustomModule()
```

For more detail, see https://github.com/realglobe-Inc/sugo-module-base#define-custom-class


### new (Module.modularize(SomeClass))()

If you want use existing class which is not a sub class of `Module`, make it actor-compatible with `Module.modularize()` utility.   

```javascript
class MyClass {
  doSomething () { /* ... */ }
}

const MyClassModularized = Module.modularize(MyClass)
 
let module04 = new MyClassModularized()
```

For more detail, see https://github.com/realglobe-Inc/sugo-module-base#modularize-existing-class