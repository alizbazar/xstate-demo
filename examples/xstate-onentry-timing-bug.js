const XState = require('xstate')

const { Machine, interpret } = XState
const { raise } = XState.actions

/*
run from cli using:
node xstate-onentry-timing-bug.js [sync|async|raise]
*/

let validate

switch (process.argv[2]) {
  case 'raise':
    validate = raise('ERROR')
    break

  case 'async':
    validate = () => {
      setTimeout(() => service.send('ERROR'))
    }
    break

  case 'sync':
  default:
    validate = () => {
      service.send('ERROR')
    }
    break
}

console.log(
  'Using `validate` action:\n',
  typeof validate === 'object' ? JSON.stringify(validate) : validate.toString(),
  '\n'
)

const m = Machine(
  {
    id: 'form',
    initial: 'filling',
    states: {
      filling: {
        on: {
          SUBMIT: 'validating',
        },
      },
      validating: {
        onEntry: 'validate',
        on: {
          SUCCESS: 'ok',
          ERROR: 'filling',
        },
      },
      ok: {},
    },
  },
  {
    actions: {
      validate,
    },
  }
)

const start = Date.now()
const timestamp = () => `${Date.now() - start}ms`.padEnd(7)

const service = interpret(m)
  .onEvent(ev => {
    console.log(timestamp(), 'event:', ev)
  })
  .onTransition(state => {
    console.log(timestamp(), 'Transition to', state.value)
  })
  .start()

const delay = ms => new Promise(resolve => setTimeout(resolve, ms || 1000))

delay()
  .then(() => console.log(timestamp(), 'submitting...') || service.send('SUBMIT'))
  .then(delay)
