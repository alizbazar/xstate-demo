const { assign } = XState.actions

// Available variables:
// Machine (machine factory function)
// XState (all XState exports)

const lightMachine = Machine({
    id: 'game',
    initial: 'playing',
    context: {
      points: 0
    },
    states: {
      playing: {
        on: {
          // Transient transition
          // Will transition to either 'win' or 'lose' immediately upon
          // (re)entering 'playing' state if the condition is met.
          '': [
            { target: 'win', cond: 'didPlayerWin' },
            { target: 'lose', cond: 'didPlayerLose' }
          ],
          // Self-transition
          AWARD_POINTS: {
            actions: assign({
              points: (ctx, e) => ctx.points + e.points
            })
          }
        }
      },
      win: { type: 'final' },
      lose: { type: 'final' }
    }
  },
  {
    guards: {
      didPlayerWin: (context, event) => {
        // check if player won
        return context.points > 99;
      },
      didPlayerLose: (context, event) => {
        // check if player lost
        return context.points < 0;
      }
    }
  });
