import { Form, Label, Input, Button, FormGroup, Col, FormFeedback, Spinner } from 'reactstrap'
import React from 'react'

// isEditing: true,
// isSubmitting: false,
// isSaved: false,
// error: null,
// value: '',
export default function MyForm({ isEditing, isSubmitting, isSaved, error, value, onInput, save, edit }) {
  return (
    <Form
      onSubmit={e => {
        e.preventDefault()
        if (isEditing) {
          save()
        } else {
          edit()
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
          invalid={error && error.code === 'inputError'}
          disabled={!isEditing || isSubmitting}
          onChange={ev => onInput(ev.target.value)}
        />
        {error && error.code === 'inputError' ? <FormFeedback>{error.message}</FormFeedback> : null}
      </FormGroup>

      <FormGroup row style={{ display: 'flex', flexDirection: 'row', justifyItems: 'flex-end' }}>
        <Col style={{ textAlign: 'right', flex: 1 }}>
          <p className="text-danger">{error && error.code === 'apiError' ? error.message : null}</p>
        </Col>
        {isSubmitting ? (
          <Col xs={{ size: 'auto' }}>
            <Spinner color="secondary" />
          </Col>
        ) : isSaved ? (
          <Col xs={{ size: 'auto' }}>Saved!</Col>
        ) : null}
        <Col xs={{ size: 'auto' }} style={{ padding: 0 }}>
          {isEditing ? <Button disabled={!value || isSubmitting}>Save</Button> : <Button>Edit</Button>}
        </Col>
      </FormGroup>
    </Form>
  )
}
