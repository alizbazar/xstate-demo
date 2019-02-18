const { assign } = XState.actions

// Available variables:
// Machine (machine factory function)
// XState (all XState exports)

const getPlayer = id => ({
  id,
  initial: 'init',
  states: {
    init: {
      on
    },
    rendered: {
      states: {
        loading: {},
        waitingToPlay: {},
        playing: {},
      }
    },
    error: {},
    waitingToDetach: {},
    detached: {},
  },
})

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
                  skipIntro: false,
                }),
              },
              {
                target: 'intro',
                actions: raise({
                  type: 'START',
                  skipIntro: false,
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
    introPlayer: getPlayer('intro'),
    practicePlayer: getPlayer('practice'),
    outroPlayer: getPlayer('outro'),
  }
}, {
  guards: {
    startFromPractice: ctx => ctx.hasIntro ? (ctx.hasPlayedIntroBefore && ctx.hasSkippedIntroBefore) : true,
  }
});
