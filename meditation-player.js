const { assign, raise } = XState.actions

// Available variables:
// Machine (machine factory function)
// XState (all XState exports)

const progressEventFactory = ({ introDuration, practiceDuration, hasOutro }) => ({current, playerElapsed}) => {
  let timeLeft
  let untilNext = null
  if (current === 'outro') {
    timeLeft = -playerElapsed
  } else if (current === 'practice') {
    untilNext = practiceDuration - playerElapsed
    timeLeft = untilNext
  } else { // intro
    untilNext = introDuration - playerElapsed
    timeLeft = untilNext + practiceDuration
  }
  return {
    type: 'PROGRESS',
    current,
    timeLeft,
    untilNext,
  }
}

const lightMachine = Machine({
  id: 'player',
  initial: 'loading',
  context: {
    hasIntro: true,
    hasPlayedIntroBefore: true,
    // hasSkippedIntroBefore: true,

    hasConclusion: true,
  },
  type: 'parallel',
  states: {
    currentPlayer: {
      initial: 'initial',
      states: {
        initial: {
          on: {
            '': [
              {
                target: 'practice',
                cond: 'startFromPractice',
                actions: raise({
                  type: 'START',
                  what: 'practice',
                }),
              },
              {
                target: 'intro',
                actions: raise({
                  type: 'START',
                  what: 'intro',
                }),
              },
            ],
          },
        },
        intro: {},
        practice: {},
        outro: {},
        end: {},
      },
    },
    playPause: {
      initial: 'isPlaying',
      states: {
        isPlaying: {},
        isPaused: {},
      },
    },
    intro: {
      id: 'intro',
      initial: 'detached',
      states: {
        detached: {
          on: {
            START: {
              cond: (ctx, e) => e.what === 'intro',
              target: 'rendered.playing',
            },
            PROGRESS: {
              cond: (ctx, e) => (
                e.current === 'practice' && e.untilNext < 30
              ),
              target: 'rendered',
            },
          },
        },
        rendered: {
          initial: 'loading',
          on: {
            SKIP: {
              cond: (ctx, e) => e.what === 'intro',
              target: 'waitingToDetach',
              actions: ctx => assign({
                skippedPosition: ctx.position,
              })
            },
          },
          states: {
            loading: {},
            playing: {},
          },
        },
        error: {},
        waitingToDetach: {
          on: {
            CANCEL_SKIP: {
              target: 'init',
              actions: ctx => ({
                type: 'rewindTo',
                position: ctx.skippedPosition,
              }),
            },
          },
        },
      },
    },
    practice: {
      id: 'practice',
      initial: 'detached',
      states: {
        detached: {
          on: {
            START: {
              cond: (ctx, e) => e.what === 'practice',
              target: 'rendered.playing',
            },
            PROGRESS: {
              cond: (ctx, e) => (
                e.current === 'practice' && e.untilNext < 30
              ),
              target: 'rendered',
            },
          },
        },
        rendered: {
          initial: 'loading',
          states: {
            loading: {},
            playing: {},
          },
        },
        error: {},
      },
    },
    outro: {
      id: 'outro',
      initial: 'detached',
      states: {
        detached: {
          on: {
            PROGRESS: {
              cond: (ctx, e) => (
                e.current === 'practice' && e.untilNext < 30
              ),
              target: 'rendered',
            },
          },
        },
        rendered: {
          initial: 'loading',
          states: {
            loading: {},
            playing: {},
          },
        },
        error: {},
        waitingToDetach: {
          on: {
            CANCEL_SKIP: {
              target: 'init',
              actions: ctx => ({
                type: 'rewindTo',
                position: ctx.skippedPosition,
              }),
            },
          },
        },
      },
    },
  }
}, {
  guards: {
    startFromPractice: ctx => ctx.hasIntro ? (ctx.hasPlayedIntroBefore && ctx.hasSkippedIntroBefore) : true,
  }
});
