import React from 'react';
import PropTypes from 'prop-types';
import { Col, Form, Button } from 'react-bootstrap';

class KeyValuePairsInput extends React.Component {
  render() {
    return (
      <div>
        <h3 style={{ padding: "20px" }}>
          {this.props.title}
        </h3>
        <Form noValidate>
          <ol>
            {Array(this.props.items).fill(0).map(() => (<li>
              <Form.Row>
                <Col sm={6}>
                  <Form.Control
                    required
                    type="text"
                    placeholder="key" />
                </Col>
                <Col sm={6}>
                  <Form.Control
                    required
                    type="text"
                    placeholder="value" />
                </Col>
              </Form.Row>
            </li>))}
          </ol>
        </Form>
        <div className="d-flex flex-row justify-content-end">
          <Button variant="outline-success">Create</Button>
        </div>
      </div>
    );
  }
}

KeyValuePairsInput.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.number.isRequired
}

export default KeyValuePairsInput;