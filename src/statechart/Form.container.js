import React from 'react'
import Form from './Form'
import { save } from '../api'
import { createMachine, eventCreators } from './chart'
import { interpret } from 'xstate'

export default class MyForm extends React.Component {
  machine = createMachine(
    {},
    {
      save: ctx => this.save(ctx.value),
    }
  )
  state = {
    current: this.machine.initialState,
  }

  service = interpret(this.machine).onTransition(current => {
    this.setState({ current })
  })

  componentDidMount() {
    this.service.start()
  }

  componentWillUnmount() {
    this.service.stop()
  }

  save = nbr => {
    save(nbr)
      .then(() => this.emit(eventCreators.success()))
      .catch(err => this.emit(eventCreators.error(err)))
  }

  emit = event => {
    this.service.send(event)
  }

  render() {
    const { value, context } = this.state.current
    return <Form current={value} ctx={context} emit={this.emit} />
  }
}
