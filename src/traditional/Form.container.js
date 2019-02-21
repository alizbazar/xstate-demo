import React from 'react'
import Form from './Form'
import { save } from '../api'

export default class MyForm extends React.Component {
  state = {
    isEditing: true,
    isSubmitting: false,
    isSaved: false,
    error: null,
    value: '',
  }
  onInput = value => {
    this.setState({ value })
  }

  edit = () => {
    this.setState({ isEditing: true })
  }

  save = () => {
    this.setState({ isSubmitting: true, error: null })
    save(this.state.value)
      .then(() => {
        this.setState({
          isSubmitting: false,
          isSaved: true,
        })
        // reset to edited mode after 2 sec
        setTimeout(this.resetState, 2000)
      })
      .catch(err => {
        this.setState({
          isSubmitting: false,
          error: err,
        })
      })
  }

  resetState = () => {
    this.setState({
      isEditing: false,
      isSaved: false,
    })
  }

  render() {
    return <Form {...this.state} save={this.save} edit={this.edit} onInput={this.onInput} />
  }
}
