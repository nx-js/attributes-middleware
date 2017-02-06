'use strict'

const compiler = require('@nx-js/compiler-util')

let currAttributes
const configs = new Map()
const attributeCache = new Map()

function attributes (elem, state, next) {
  if (elem.nodeType !== 1) return

  currAttributes = getAttributes(elem)
  elem.$attribute = $attribute
  next()

  currAttributes.forEach(processAttributeWithoutConfig, elem)
  configs.forEach(processAttributeWithConfig, elem)
  configs.clear()
}
attributes.$name = 'attributes'
attributes.$require = ['observe']
module.exports = attributes

function $attribute (name, config) {
  if (typeof name !== 'string') {
    throw new TypeError('First argument must be a string')
  }
  if (typeof config === 'function') {
    config = { handler: config }
  }
  if (typeof config !== 'object') {
    throw new TypeError('Second argument must be an object or a function')
  }
  if (!config.handler) {
    throw new Error(`${name} attribute must have a handler`)
  }
  if (currAttributes.has(name)) {
    configs.set(name, config)
  }
}

function getAttributes (elem) {
  const cloneId = elem.getAttribute('clone-id')
  let attributes
  if (cloneId) {
    attributes = attributeCache.get(cloneId)
    if (!attributes) {
      attributes = cacheAttributes(elem.attributes)
      attributeCache.set(cloneId, attributes)
    }
    return attributes
  }
  return cacheAttributes(elem.attributes)
}

function cacheAttributes (attributes) {
  let i = attributes.length
  const cachedAttributes = new Map()
  while (i--) {
    const attribute = attributes[i]
    let type = attribute.name[0]
    let name = attribute.name
    if (type === '$' || type === '@') {
      name = name.slice(1)
    } else {
      type = ''
    }
    cachedAttributes.set(name, {value: attribute.value, type})
  }
  return cachedAttributes
}

function processAttributeWithoutConfig (attr, name) {
  if (!configs.has(name)) {
    if (attr.type === '$') {
      const expression = compiler.compileExpression(attr.value || name)
      processExpression.call(this, expression, name, defaultHandler)
    } else if (attr.type === '@') {
      const expression = compiler.compileExpression(attr.value || name)
      this.$observe(processExpression, expression, name, defaultHandler)
    }
  }
}

function processAttributeWithConfig (config, name) {
  const attr = currAttributes.get(name)

  if (config.type && config.type.indexOf(attr.type) === -1) {
    throw new Error(`${name} attribute is not allowed to be ${attr.type || 'normal'} type`)
  }
  if (config.init) {
    config.init.call(this)
  }

  if (attr.type === '@') {
    const expression = compiler.compileExpression(attr.value || name)
    this.$observe(processExpression, expression, name, config.handler)
  } else if (attr.type === '$') {
    const expression = compiler.compileExpression(attr.value || name)
    processExpression.call(this, expression, name, config.handler)
  } else {
    config.handler.call(this, attr.value, name)
  }
}

function processExpression (expression, name, handler) {
  const value = expression(this.$contextState)
  handler.call(this, value, name)
}

function defaultHandler (value, name) {
  if (value) {
    this.setAttribute(name, value)
  } else {
    this.removeAttribute(name)
  }
}
