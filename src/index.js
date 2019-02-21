import React from 'react'
import ReactDOM from 'react-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Container, Row, Col } from 'reactstrap'
import Form from './statechart/Form.container'

class App extends React.Component {
  render() {
    return (
      <Container>
        <Row style={{ marginTop: 50 }}>
          <Col sm={{ size: 6, offset: 1 }}>
            <Form />
          </Col>
        </Row>
      </Container>
    )
  }
}

var mountNode = document.getElementById('app')
ReactDOM.render(<App />, mountNode)
