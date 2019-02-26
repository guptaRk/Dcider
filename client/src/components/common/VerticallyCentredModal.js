import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

// Whatever you want to display inside the Modal
class VerticallyCentredModal extends React.Component {
  render() {
    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onHide}
        size="lg"
        centered>
        <Modal.Header closeButton>
          {this.props.heading}
        </Modal.Header>
        <Modal.Body>
          {this.props.children}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

VerticallyCentredModal.prototypes = {
  show: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  heading: PropTypes.string.isRequired
}

export default VerticallyCentredModal;