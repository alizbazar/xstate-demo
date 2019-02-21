const XState = require('xstate')
const { Machine } = XState
const { assign, raise } = XState.actions

// Available variables:
// Machine (machine factory function)
// XState (all XState exports)


const statechart = {
  id: 'meditation-player',
  initial: 'initial',
  context: {
    // provided context
    hasIntro: false,
    hasPlayedIntroBefore: false,
    hasSkippedIntroBefore: false,

    hasOutro: false,
    hasPlayedOutroBefore: false,
    hasSkippedOutroBefore: false,

    // internal variables
    error: null,
    skippedTrack: 'intro',
    skippedAt: 123,
    trackTimeInSec: 0,
  },
  type: 'parallel',
  on: {
    PROGRESS: 'saveProgress',
  },
  states: {
    track: {
      id: 'track',
      initial: 'initial',
      states: {
        initial: {
          on: {
            '': [
              {
                cond: 'shouldPlayIntro',
                target: 'intro',
              },
              {
                target: 'practice',
              },
            ],
          },
        },
        intro: {
          onEntry: 'resetPlayer',
          on: {
            TRACK_END: 'practice',
            SKIP: {
              target: 'practice',
              actions: 'saveSkipIntro',
            },
          }
        },
        practice: {
          onEntry: 'resetPlayer',
          on: {
            TRACK_END: [{
              cond: 'shouldPlayOutro',
              target: 'outro',
            }, {
              target: 'overtime',
              actions: 'saveSkipIntro',
            }],
            CANCEL_SKIP: {
              target: 'intro',
            },
          }
        },
        outro: {
          onEntry: 'resetPlayer',
          on: {
            TRACK_END: 'overtime',
            SKIP: {
              target: 'overtime',
              actions: 'saveSkipIntro',
            }
          }
        },
        overtime: {
          onEntry: 'endPractice',
          on: {
            CANCEL_SKIP: {
              target: 'outro',
            },
          }
        },
      }
    },
    controls: {
      initial: 'shown',
      states: {
        shown: {
          after: {
            3000: 'hidden',
          },
          on: {
            HIDE: 'hidden',
          },
        },
        hidden: {
          on: {
            SHOW: 'shown',
          },
        },
      }
    },
    player: {
      id: 'player',
      initial: 'playing',
      on: {
        _RESET_PLAYER: 'player.playing',
        _END: 'player.final',
      },
      states: {
        playing: {
          after: {
            2000: 'buffering',
          },
          on: {
            PAUSE: 'paused',
            PROGRESS: 'playing', // reset timer
          },
        },
        paused: {
          on: {
            PLAY: 'playing',
          },
        },
        buffering: {
          after: {
            10000: {
              target: 'error',
              actions: 'bufferingTimeout',
            },
          },
          on: {
            PROGRESS: 'playing',
          },
        },
        error: {
          on: {
            // allow still return to 'playing' state if
            // playback suddenly starts again
            PROGRESS: 'playing',
            RETRY: 'retrying',
          },
        },
        retrying: {
          after: {
            100: 'playing',
          },
        },
        final: {},
      },
    },

    overtimeClock: {
      id: 'overtimeClock',
      initial: 'isOff',
      states: {
        isOff: {
          onExit: 'resetTrackTime',
          on: {
            _END: 'isOn',
          },
        },
        isOn: {
          on: {
            CANCEL_SKIP: 'isOff',
          },
          after: {
            1000: { actions: 'incrementOvertime', target: 'isOn' },
          },
        },
      }
    },

    didSkip: {
      initial: 'no',
      states: {
        no: {
          on: {
            SKIP: 'yes',
          },
        },
        yes: {
          on: {
            TRACK_END: 'no',
            CANCEL_SKIP: 'no',
          },
        },
      }
    },
  },
}

const actions = {
  saveSkipIntro: assign({
    skippedTrack: (ctx, e) => e.track,
    skippedAt: (ctx, e) => e.skippedAt || 0,
  }),
  bufferingTimeout: assign({ error: 'BUFFERING_TIMEOUT' }),
  saveProgress: assign({ trackTimeInSec: (ctx, e) => e.trackTimeInSec }),
  resetPlayer: raise('_RESET_PLAYER'),
  endPractice: raise('_END'),
  resetTrackTime: assign({ trackTimeInSec: 0 }),
  incrementOvertime: assign({ trackTimeInSec: ctx => ctx.trackTimeInSec + 1 }),
}

const guards = {
  shouldPlayIntro: ctx => ctx.hasIntro ? (!ctx.hasPlayedIntroBefore || !ctx.hasSkippedIntroBefore) : false,
  shouldPlayOutro: ctx => ctx.hasOutro ? (!ctx.hasPlayedOutroBefore || !ctx.hasSkippedOutroBefore) : false,
}

const createMachine = (context, extActions) => Machine(statechart, {
  actions: {
    ...actions,
    ...extActions,
  },
  guards,
}, {
  ...statechart.context,
  ...context,
})

const eventCreators = {
  sendTrackEnd: track => ({
    type: 'TRACK_END',
    track,
  }),

  sendSkip: (track, skippedAt) => ({
    type: 'SKIP',
    skippedAt,
    track,
  }),

  sendProgress: (trackTimeInSec) => ({ TYPE: 'PROGRESS', trackTimeInSec }),
}

const PRELOAD_BEFORE = 30 // sec
const SHOW_SKIP_FOR = 10
const RELEASE_AFTER_SKIP = 15
function timeBasedStateFactory ({ introDuration, practiceDuration, outroDuration }) {

  return function getState (current, trackTimeInSec, skippedTrack) {
    let preload = null
    if (current === 'intro' || (current === 'practice' && outroDuration)) {
      const next = current === 'intro' ? 'practice' : 'outro'
      const durationLeft = (current === 'intro' ? introDuration : practiceDuration) - trackTimeInSec
      if (durationLeft < PRELOAD_BEFORE) {
        preload = next
      }
    }
    let timeDisplayed
    let untilNext = null
    if (current === 'outro') {
      timeDisplayed = -playerElapsed
    } else if (current === 'overtime') {
      timeDisplayed = -playerElapsed - outroDuration
    } else if (current === 'practice') {
      timeDisplayed = untilNext
    } else { // intro
      timeDisplayed = untilNext + practiceDuration
    }
    return {
      showSkip: (current === 'intro' || current === 'outro') && trackTimeInSec < SHOW_SKIP_FOR,
      showCancelSkip: skippedTrack === 'outro' || (skippedTrack === 'intro' && current === 'practice' && trackTimeInSec < RELEASE_AFTER_SKIP),
      timeDisplayed, // sec
      preload,
    }
  }
}

module.exports = {
  createMachine,
  timeBasedStateFactory,
  eventCreators,
}
