const { assign, raise } = XState.actions

const ui = Machine({
  id: 'moodDiary',
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
      initial: 'init',
      on: {
        TYPE: {
          actions: 'memorizeComment',
          target: '.init',
        },
      },
      states: {
        init: {
          on: {
            '': [{
              cond: 'commentIsEmpty',
              target: 'empty',
            }, {
              target: 'filled',
            }]
          },
        },
        empty: {
          on: {
            CANCEL: '#moodDiary.start',
          },
        },
        filled: {
          on: {
            SAVE: '#moodDiary.saving',
          },
        },
      },
    },
    saving: {
      onEntry: 'save',
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
  guards: {
    commentIsEmpty: ctx => !ctx.comment,
  },
  actions: {
    memorizeMood: assign({ moodSelected: (ctx, e) => e.mood }),
    memorizeComment: assign({ comment: (ctx, e) => e.comment }),
    storeError: assign({ error: (ctx, e) => e.error }),
    resetContext: assign({ moodSelected: null, comment: null, error: null }),
  },
})

/*
Expected events:

{ type: 'SELECT', mood: 'happy' }
{ type: 'SAVE' }
{ type: 'ERROR', error: 'TIMEOUT' }
{ type: 'SUCCESS' }
{ type: 'TYPE', comment: 'asdfasdf...' }

Expected actions:

animateToWrite
showHistory
save({moodSelected, comment})

*/