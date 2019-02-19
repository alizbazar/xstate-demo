const { assign, raise } = XState.actions

const ui = Machine({
  id: 'player',
  initial: 'start',
  context: {
    moodSelected: null,
    comment: null,
    error: null,
  },
  states: {
    start: {
      onEntry: 'resetContext',
      on: {
        SELECT: {
          target: 'transitioningToWriteComment',
          actions: 'memorizeMood',
        },
      },
    },
    transitioningToWriteComment: {
      onEntry: 'animateToWrite',
      after: {
        300: 'writeComment',
      },
    },
    writeComment: {
      on: {
        SAVE: {
          target: 'saving',
          actions: ['memorizeComment', 'save'],
        },
      }
    },
    saving: {
      on: {
        ERROR: {
          target: 'writeComment',
          actions: 'storeError',
        },
        SUCCESS: 'saved',
      }
    },
    saved: {
      onEntry: 'animateToSaved',
      after: {
        300: { actions: 'showHistory' },
        1000: 'start',
      },
    },
  },
}, {
  actions: {
    memorizeMood: assign({ moodSelected: (ctx, e) => e.mood }),
    memorizeComment: assign({ comment: (ctx, e) => e.comment }),
    storeError: assign({ error: (ctx, e) => e.error }),
    resetContext: assign({ moodSelected: null, comment: null, error: null }),
  },
})


{ type: 'SELECT', mood: 'happy' }
{ type: 'SAVE', comment: 'asdfasdf...' }
{ type: 'ERROR', error: 'TIMEOUT' }