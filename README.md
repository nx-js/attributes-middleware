# The attributes middleware

The `attributes` middleware extends native attributes with dynamic behavior and provides a way to add custom attributes.

- name: attributes
- direct middleware dependencies: [observe](https://github.com/nx-js/observe-middleware)
- all middleware dependencies: [observe](https://github.com/nx-js/observe-middleware)
- processes: element nodes
- throws on: nothing
- use as: component or content middleware
- [docs](http://nx-framework/docs/middlewares/attributes)

## Installation

`npm install @nx-js/attributes-middleware`

## Usage

```js
const component = require('@nx-js/core')
const observe = require('@nx-js/observe-middleware')
const attributes = require('@nx-js/attributes-middleware')

component()
  .useOnContent(observe)
  .useOnContent(attributes)
  .register('attributes-comp')
```

```html
<attributes-comp>
  <span @hidden="!show">Hello World!</span>
</animated-comp>
```
