import { Form, Label, Input, Button, FormGroup, Col, FormFeedback, Spinner } from 'reactstrap'
import React from 'react'
import { eventCreators } from './chart'
import _ from 'lodash'

const { input, edit, submit } = eventCreators

// isEditing: true,
// isSubmitting: false,
// isSaved: false,
// error: null,
// value: '',
export default function MyForm({ current, ctx, emit }) {
  const { errorMessage, value } = ctx

  return (
    <Form
      onSubmit={e => {
        e.preventDefault()
        if (_.get(current, 'editing')) {
          emit(submit())
        } else {
          emit(edit())
        }
      }}
    >
      <FormGroup row>
        <Label for="phoneNbr">Phone</Label>
        <Input
          type="phone"
          name="phone"
          id="phoneNbr"
          placeholder="000-000-0000"
          invalid={_.get(current, 'editing.error') === 'input'}
          disabled={_.get(current, 'editing.form') !== 'acceptingInput'}
          onChange={ev => emit(input(ev.target.value))}
        />
        {_.get(current, 'editing.error') === 'input' ? <FormFeedback>{errorMessage}</FormFeedback> : null}
      </FormGroup>

      <FormGroup row style={{ display: 'flex', flexDirection: 'row', justifyItems: 'flex-end' }}>
        <Col style={{ textAlign: 'right', flex: 1 }}>
          <p className="text-danger">{_.get(current, 'editing.error') === 'api' ? errorMessage : null}</p>
        </Col>
        {_.get(current, 'editing.form') === 'submitting' ? (
          <Col xs={{ size: 'auto' }}>
            <Spinner color="secondary" />
          </Col>
        ) : _.get(current, 'editing.form') === 'submitted' ? (
          <Col xs={{ size: 'auto' }}>Saved!</Col>
        ) : null}
        <Col xs={{ size: 'auto' }} style={{ padding: 0 }}>
          {current === 'displaying' ? (
            <Button>Edit</Button>
          ) : (
            <Button disabled={!value || _.get(current, 'editing.form') !== 'acceptingInput'}>Save</Button>
          )}
        </Col>
      </FormGroup>
    </Form>
  )
}
