import React from 'react';
import { Form, Col, Button, InputGroup, FormControl } from 'react-bootstrap';
import FormInputSelectGroup from './common/FormInputSelectGroup';

class RoomInit extends React.Component {
  render() {
    return (
      <div
        className="d-flex flex-column"
        style={{ margin: "50px" }}>
        <div>
          <Form noValidate>
            {/* Instead of Form.Row we could have used 
                Form.Group and has changed the "as={Row}".
                so, by default it will create a group using 
                'Row' instead of a 'div' as in the next group */}
            <Form.Row controlId="title">
              <Col sm={12}>
                <Form.Control
                  type="text"
                  placeholder="Title"
                  aria-label="Title"
                  isInvalid={true}
                />
                <Form.Control.Feedback type="invalid">
                  Looks good!
                </Form.Control.Feedback>
              </Col>
            </Form.Row>

            <FormInputSelectGroup
              label="Data Type for Key"
              titleForDropdown="select" />

            <FormInputSelectGroup
              label="Data Type for Value"
              titleForDropdown="select" />

            <Form.Row controlId="EndDate">
              <Form.Label
                column sm={3}
                style={{ "padding-top": "10px" }} >
                End Date
              </Form.Label>
              <Col sm={9}>
                <InputGroup>
                  <Form.Control
                    type="date"
                    placeholder="date"
                    aria-label="Title"
                    isInvalid={true}
                  />

                  <Form.Control
                    type="time"
                    placeholder="time"
                    aria-label="end date's time"
                    isInvalid={true}
                  />
                  <FormControl.Feedback type="invalid">
                    Have to check that whether start time is less
                  </FormControl.Feedback>
                </InputGroup>
              </Col>
            </Form.Row>

            <Form.Row>
              <Form.Label column sm={3}>
                Entries in Poll
              </Form.Label>
              <Col sm={9}>
                <Form.Control
                  type="number"
                  aria-label="number of entries in the poll"
                  isInvalid={true} />
                <Form.Control.Feedback type="invalid">
                  Checking for the number to not more than 15
                </Form.Control.Feedback>
              </Col>
            </Form.Row>

          </Form >
        </div>
        <div className="d-flex flex-row justify-content-end">
          {/* TODO : Setting the onclick listener */}
          <Button variant="outline-success">Next</Button>
        </div>
      </div>
    );
  }
}

export default RoomInit;