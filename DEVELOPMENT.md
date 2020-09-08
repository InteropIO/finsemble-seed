# Developing Finsemble-UI

🚧 This is Cosaic's internal documentation for working on the finsemble-ui library.
Users can safely ignore. 🚧

## Project Requirements

### Build Requirements

1.  The library shall be delivered as a single NPM package.
2.  The library shall be usable as either a typescript or a javascript library.

## Typescript Requirements

1.  The library shall be compiled in strict mode
    (see[ ](https://www.google.com/url?q=https://www.typescriptlang.org/docs/handbook/compiler-options.html)&sa=D&ust=1581539948628000)[https://www.typescriptlang.org/docs/handbook/compiler-options.html)](https://www.google.com/url?q=https://www.typescriptlang.org/docs/handbook/compiler-options.html)&sa=D&ust=1581539948628000)
2.  The library shall use optional chaining and null coalescense for optional property access.
    - The lib shall not use lodash.set and get, && chaining, or ternary operators to accomplish this purpose.
3.  All types shall be as precise and accurate as reasonable.
    - The `any` type shall not be used whenever a more accurate type is known.
    - Prefer generics over `any`. For example:

```javascript
function map(cb: (el: T1) => T2, array: T1[]): T2[] {
	//...
}
```

- There are places where the type cannot be known, or the function's
  output does not depend on the type input. A prime example is logging.

```javascript
function log(...args: any[]): void { ... }
```

- All nullable types shall be designated as such with the ? suffix or with | undefined.

For example:

```javascript
// Incorrect example
const foo: Record = { bar: 7 };
foo.quux; // type is number, but value is undefined!

// Correct example
const foo: Record = { bar: 7 };
foo.quux; // type is (number | undefined), which is correct
```

Whenever Typescript cannot infer the correct type, you may use casting if you are absolutely sure of the correct type. For example, the following is allowed:

```javascript
const foo: Record = {bar: 7}
const bar = Object.values(foo) as number[];
```

## Component Requirements

1. All React Components shall be functions (as opposed to classes).
2. For simple, one-off cases, the component code may directly call Finsemble clients from within a useEffect hook, bypassing the effects API and Redux infrastructure. (These should be the exception, not the rule)
3. All component state is captured either in the Redux Store or in useState hooks. The following guidelines determine which one:
   - useState may be used only if that state is not passed down to child components, shared with other peer components, OR if child components are only "dumb components" (see[ ](https://www.google.com/url?q=https://alligator.io/react/smart-dumb-components/&sa=D&ust=1581539948631000)[https://alligator.io/react/smart-dumb-components/](https://www.google.com/url?q=https://alligator.io/react/smart-dumb-components/&sa=D&ust=1581539948631000) for definition of smart vs. dumb components)
   - In all other cases, use the Store.
4. Prefer Context API over "prop drilling" (deep prop-passing hierarchies)

## Redux Requirements

1. All reducer functions shall be pure functions (free from all side effects, including logging, network requests, etc.).
2. The library shall use Immer to create immutable redux values with a mutable API.

- The library shall avoid the pitfalls listed here:[ ](https://www.google.com/url?q=https://immerjs.github.io/immer/docs/pitfalls&sa=D&ust=1581539948632000)[https://immerjs.github.io/immer/docs/pitfalls](https://www.google.com/url?q=https://immerjs.github.io/immer/docs/pitfalls&sa=D&ust=1581539948632000)
- The library shall use the produce API in each reducer (as opposed to a single higher-order reducer)

3. Reducers shall be typesafe from end to end.
4. Actions shall be specified using the Unionize library. Actions shall be created for dispatch using Unionize's factory functions.
5. Logging shall be achieved by a single, top level meta-reducer (a.k.a middleware)
6. Actions are namespaced. E.g. "Linker Menu/Toggle Linker"
7. In development mode, the library shall use the Redux-DevTools for diagnostics.

- For guidance on setting this up, see:[ ](https://www.google.com/url?q=https://github.com/jkzing/vscode-redux-devtools&sa=D&ust=1581539948633000)[https://github.com/jkzing/vscode-redux-devtools](https://www.google.com/url?q=https://github.com/jkzing/vscode-redux-devtools&sa=D&ust=1581539948633000)

22. The store shall be normalized according to the guidelines here: [https://redux.js.org/recipes/structuring-reducers/normalizing-state-shape/](https://www.google.com/url?q=https://redux.js.org/recipes/structuring-reducers/normalizing-state-shape/&sa=D&ust=1581539948633000)

## Hooks Requirements

23. The only internal dependency of the hooks code shall be the action factories created with Unionize and the effects code.
24. All side effects (including Finsemble client calls and action dispatch) shall be exported as React Hooks based on useEffect.
25. Because the hooks serve as the public API of the library, all hook code shall be thoroughly documented with JSDoc strings.
26. As much as possible, the library shall relegate conditional logic to the reducer, keeping the hook code condition-free.
    - The rationale: Reducers are pure functions. Pure functions are easy to reason about, write, and test. Conditionals are hard (if(menuIsOpen && !menuIsException && config.autoClose gets really tricky really fast). Keeping them in pure functions makes them less hard.

## Testing Requirements and Guidelines

The following policies are experimental. Give them a shot - but if you find they can be improved, talk to the chief architect.

The guiding principle is that conditional business logic (anything with `if` or `switch` statement that depends on domain knowledge),
should have tests, because unit tests are an excellent development tool, aide in understanding the code, and can prevent regressions.
In general, conditional business logic should be relegated to the reducer functions; however, if this proves too difficult, exceptions
can be made in the hooks.

1. Every reducer shall have 100% test coverage via unit tests.
2. Component code is not required to have testing coverage. React encourages building complex UI's from smaller, simpler one's, and if you find a particular component is getting difficult to understand, consider refactoring.
3. Effect code is not required to have test coverage. For the most part, effect functions should not contain conditional business logic - instead, push the logic up into the reducers or hooks (preferably the reducers).
4. Hook code is not required to have test coverage. Prefer to keep conditional business logic inside the reducer when possible. If this proves too cumbersome, consider extracting the logic into a pure function that maps a paritcular state and input to the desired effect, and test that function. Prefer functional programming techniques over mocking. For example the:

```javascript
// Bad example - conditional code is mixed in with Finsemble service calls.
const useFoo = () => {
	...
	if(!state.foo.ignoreBar && state.foo.bar > state.baz) {
		await FSBL.FooClient.doFoo(foo, "start")
	} else {
		await FSBL.FooClient.cancelFoo(foo);
	}
	...
}
```

```javascript
// Better example - Conditional code is encapsultaed in pure function.
const doFoo (foo: Foo) => await FSBL.FooClient.doFoo(foo, "start");
const cancelFoo (foo: Foo) => await FSBL.FooClient.cancelFoo(foo);

// Because this is a pure function (returns a function reference but doesn't invoke),
// it's easily testable.
const decideFoo = (foo) => {
	return (!state.foo.ignoreBar && state.foo.bar > state.baz)
		? doFoo : cancelFoo;
}

const useFoo = () => {
	...
	decideFoo(foo)();
	...
}
```

## Recommended Reading

Dan Abramov's post on setTimeout and useRef
https://overreacted.io/making-setinterval-declarative-with-react-hooks/

Dan Abramov's comments on React portals
https://github.com/facebook/react/issues/12355#issuecomment-410996235
