const { assign, raise } = XState.actions

// Available variables:
// Machine (machine factory function)
// XState (all XState exports)


const part = Machine({
  id: 'playback-part',
  initial: 'initial',
  context: {
    // provided context
    hasIntro: true,
    hasPlayedIntroBefore: true,
    hasSkippedIntroBefore: true,

    hasOutro: true,
    hasPlayedOutroBefore: true,
    hasSkippedOutroBefore: true,

    // internal variables
    error: null,
    skippedTrack: 'intro',
    skippedAt: 123,
  },
  type: 'parallel',
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
          onEntry: raise('_RESET_PLAYER'),
          on: {
            TRACK_END: 'practice',
            SKIP: {
              target: 'practice',
              actions: 'saveSkipIntro',
            },
          }
        },
        practice: {
          onEntry: raise('_RESET_PLAYER'),
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
          onEntry: raise('_RESET_PLAYER'),
          on: {
            TRACK_END: 'overtime',
            SKIP: {
              target: 'overtime',
              actions: 'saveSkipIntro',
            }
          }
        },
        overtime: {
          onEntry: raise('_END'),
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
              actions: assign({
                error: 'BUFFERING_TIMEOUT',
              }),
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
}, {
  actions: {
    saveSkipIntro: (ctx, e) => assign({
      skippedTrack: e.track,
      skippedAt: e.skippedAt || 0,
    }),
  },
  guards: {
    shouldPlayIntro: ctx => ctx.hasIntro ? (!ctx.hasPlayedIntroBefore || !ctx.hasSkippedIntroBefore) : false,
    shouldPlayOutro: ctx => ctx.hasOutro ? (!ctx.hasPlayedOutroBefore || !ctx.hasSkippedOutroBefore) : false,
  },
})

const sendTrackEnd = track => send({
  type: 'TRACK_END',
  track,
})

const sendSkip = (track, skippedAt) => send({
  type: 'SKIP',
  skippedAt,
  track,
})

const sendProgress = () => send({ TYPE: 'PROGRESS' })

const PRELOAD_BEFORE = 30 // sec
const SHOW_SKIP_FOR = 10
const RELEASE_AFTER_SKIP = 15
function timeBasedPlayerRender ({ introDuration, practiceDuration, outroDuration }) {

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
