const XState = require('xstate')
const { Machine } = XState

const { assign } = XState.actions

const statechart = {
  id: 'form',
  initial: 'editing',
  context: {
    value: '',
    errorMessage: '',
  },
  states: {
    editing: {
      type: 'parallel',
      states: {
        form: {
          initial: 'acceptingInput',
          states: {
            acceptingInput: {
              on: {
                INPUT: { actions: 'storeInput' },
                SUBMIT: {
                  cond: 'ctxIsFilled',
                  target: 'submitting',
                  actions: 'clearError',
                },
              },
            },
            submitting: {
              onEntry: 'save',
              on: {
                ERROR: 'acceptingInput',
                SUCCESS: 'submitted',
              },
            },
            submitted: {
              after: {
                1000: '#form.displaying',
              },
            },
          },
        },
        error: {
          initial: 'no',
          states: {
            no: {
              on: {
                ERROR: [
                  {
                    cond: 'isInputError',
                    target: 'input',
                    actions: 'storeError',
                  },
                  { target: 'api', actions: 'storeError' },
                ],
              },
            },
            input: {
              on: {
                SUBMIT: 'no',
              },
            },
            api: {
              on: {
                SUBMIT: 'no',
              },
            },
          },
        },
      },
    },
    displaying: {
      on: {
        EDIT: 'editing',
      },
    },
  },
}

const guards = {
  ctxIsFilled: ctx => !!ctx.value,
  isInputError: (ctx, e) => e.code === 'inputError',
}

const actions = {
  storeInput: assign({ value: (ctx, e) => e.value }),
  storeError: assign({ errorMessage: (ctx, e) => e.message }),
  clearError: assign({ errorMessage: '' }),
}

const createMachine = (context, extActions) =>
  Machine(
    statechart,
    {
      actions: Object.assign({}, actions, extActions),
      guards,
    },
    Object.assign({}, statechart.context, context)
  )

const eventCreators = {
  input: value => ({ type: 'INPUT', value }),
  error: err => ({ type: 'ERROR', message: err.message, code: err.code }),
  edit: () => ({ type: 'EDIT' }),
  submit: () => ({ type: 'SUBMIT' }),
  success: () => ({ type: 'SUCCESS' }),
}

/*

{ type: 'INPUT', value: 'foo' }
{ type: 'ERROR', code: 'apiError', message: 'Somethings wrong' }
{ type: 'ERROR', code: 'inputError', message: 'Check your input' }

# Actions expected:
save
*/

export { eventCreators, createMachine }
