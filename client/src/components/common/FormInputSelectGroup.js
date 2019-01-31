import React from 'react';
import PropTypes from 'prop-types';
import { Form, Col, Row, InputGroup, DropdownButton, Dropdown } from 'react-bootstrap';

class FormInputSelectGroup extends React.Component {
  render() {
    return (
      <Form.Group as={Row} controlId="key_type">

        <Col sm={3}>
          <Form.Label style={{ "padding-top": "10px" }}>
            {this.props.label}
          </Form.Label>
        </Col>

        <Col sm={9}>
          <InputGroup>
            <DropdownButton
              as={InputGroup.Append}
              variant="outline-secondary"
              title={this.props.titleForDropdown}>

              <Dropdown.Item>String</Dropdown.Item>
              <Dropdown.Item>Date</Dropdown.Item>
              <Dropdown.Item>Time</Dropdown.Item>
              <Dropdown.Item>Integer</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item>Supply a Regex</Dropdown.Item>

            </DropdownButton>

            <Form.Control
              type="text"
              aria-label={this.props.label}
              disabled
            />

          </InputGroup>
        </Col>

      </Form.Group>
    );
  }
}

FormInputSelectGroup.PropTypes = {
  label: PropTypes.string.isRequired,
  titleForDropdown: PropTypes.string.isRequired
};

export default FormInputSelectGroup;