const {
  createMachine,
  eventCreators,
  timeBasedStateFactory,
} = require('./meditation-player-2')
const { Machine, interpret } = require('xstate')



const machine = createMachine({
  hasIntro: true,
  hasPlayedIntroBefore: true,
  hasSkippedIntroBefore: true,

  hasOutro: true,
  hasPlayedOutroBefore: true,
  hasSkippedOutroBefore: true,
}, {
  foo: (ctx, e) => console.log('TESTTT', ctx, e),
})

let state

// Interpret the machine, and add a listener for whenever a transition occurs.
const service = interpret(machine).onTransition(nextState => {
  state = nextState
  console.log(nextState.value);
});

// Start the service
service.start();

// Send events
service.send('SOME_EVENT');

module.exports = {
  getState: () => state,
  send: (...args) => service.send(...args),
}
