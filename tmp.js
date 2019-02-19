
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

const part = Machine({
  id: 'playback-part',
  initial: 'initial',
  context: {
    didSkip: true,
    didSkipFrom: 123,
  },
  states: {
    skipIntro: {
      states: {
        show: {},
        hide: {},
      }
    },
  }
})

const part = Machine({
  id: 'playback-part',
  initial: 'initial',
  context: {
    skippedTrack: 'intro',
    skippedAt: 123,
  },
  type: 'parallel',
  states: {
    play: {
      initial: 'playing',
      states: {
        playing: {},
        paused: {},
      }
    },
    skip: {
      initial: 'hide',
      states: {
        hide: {},
        show: {
          on: {
            PROGRESS: {
              cond: 'skipNoMore',
              target: 'hide',
            },
            TRACK_END: {

            }
          }
        },
      }
    },
    didSkip: {
      initial: 'no',
      states: {
        no: {},
        yes: {
          on: {
            PROGRESS: {
              cond: 'skippedLongAgo',
              target: 'no',
            }
          }
        },
      }
    },
  }
}, {
  gates: {
    skipNoMore: (ctx, e) => e.trackPosition > SHOW_SKIP_FOR,
    skippedLongAgo: (ctx, e) => e.trackPosition > RELEASE_AFTER_SKIP,
  }
})

const part = Machine({
  id: 'playback-part',
  initial: 'initial',
  context: {
    skippedTrack: 'intro',
    skippedAt: 123,
  },
  type: 'parallel',
  states: {
    play: {
      initial: 'playing',
      states: {
        playing: {},
        paused: {},
      }
    },
    skip: {
      initial: 'hide',
      states: {
        hide: {},
        show: {
          on: {
            PROGRESS: {
              cond: 'skipNoMore',
              target: 'hide',
            },
            TRACK_END: {

            }
          }
        },
      }
    },
    didSkip: {
      initial: 'no',
      states: {
        no: {},
        yes: {
          on: {
            PROGRESS: {
              cond: 'skippedLongAgo',
              target: 'no',
            }
          }
        },
      }
    },
  }
})
const ui = Machine({
  id: 'player',
  initial: 'playing',
  context: {

  },
  states: {
    playing: {},
    buffering: {},
    error: {},
    overtime: {},
  },
})


const lightMachine = Machine({
  initial: 'isPlaying',
  states: {
    moo: {
      initial: 'poo',
      states: {
        poo: {
          on: {
            PING: 'foo',
          },
        },
        foo: {},
      },
    },
    foo: {},
  },
})


const ui = Machine({
  id: 'player',
  initial: 'playing',
  context: {

  },
  states: {
    playing: {
      on: {
        FOO: {
          target: 'buffering',
          actions: {
            type: 'bar',
            moo: 'poo',
          }
        }
      }
    },
    buffering: {},
  },
}, {
  actions: {
    bar: (ctx, e) => {
      console.log(e)
    }
  }
})



const ui = Machine({
  id: 'player',
  initial: 'playing',
  context: {

  },
  on: {
    FOO: '.buffering',
  },
  states: {
    playing: {},
    buffering: {},
    error: {},
    overtime: {},
  },
})
