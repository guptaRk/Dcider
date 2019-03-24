import React from 'react';
import { Button, Table, Form, Row, Col } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import './index.css';

import server from '../../Axios';
import VerticallyCenteredModal from '../common/VerticallyCentredModal';

class Display extends React.Component {
  isUnmount = false;

  state = {
    // Data returned from the api itself
    owner: "",
    keys: [],
    values: [],
    name: "",
    lastUpdated: Date.now(),

    // adding a new poll-item
    addPollItemClicked: false,
    addError: null,
  };

  componentDidMount() {
    const { name } = this.props.match.params;
    server.get(`/pollItem/${name}`)
      .then(result => {
        if (this.isUnmount) return;
        this.setState(prvState => {
          return { ...prvState, ...result.data };
        });
      })
      .catch(err => {
        if (this.isUnmount) return;
        if (err.response) {
          if (err.response.status === 400 && err.response.data.token) {
            // Token expires or it is deleted by the user
            this.props.logout();
            return;
          }
          // Internal server error or other errors that are not created
          // due to sending the request from the client side
          console.log(err);
        }
      });
  }

  componentWillUnmount() {
    this.isUnmount = true;
  }

  addPollItem = e => {
    // as the button has type 'submit' so it will
    // automatically submit the form on pressing enter
    // in the last field of the form and do the default POST action
    e.preventDefault();

    const key = this.refs.keyName.value;
    const value = this.refs.valueName.value;
    const task = this.refs.task.value;
    server.post(`/pollItem/${this.state.name}/${task}`, { key, value })
      .then(result => {
        if (this.isUnmount) return;
        this.setState({
          keys: result.data.keys,
          values: result.data.values,
          addPollItemClicked: false,
          addError: null
        });
      })
      .catch(err => {
        if (this.isUnmount) return;
        if (err.response) {
          if (err.response.status === 400 && err.response.data.token) {
            // Token expires or it is deleted by the user
            this.props.logout();
            return;
          }
          if (err.response.status === 400 && err.response.data.key_value) {
            this.setState({ addError: err.response.data.key_value });
            return;
          }
          // Internal server error or other errors that are not created
          // due to sending the request from the client side
          console.log(err);
        }
      });
  }

  render() {
    // make a random combination of key value pairs to show
    const keyValuePairs = [];
    for (let i = 0; i < this.state.keys.length; i += 1)
      keyValuePairs.push([this.state.keys[i], this.state.values[i]]);

    return (
      <div>
        <p className="mb-3 border border-light p-2">{this.state.name}</p>

        <Table bordered striped>
          <thead>
            <tr>
              <th>Keys</th>
              <th>Values</th>
            </tr>
          </thead>
          <tbody>
            {keyValuePairs.map(x => (
              <tr key={`key_value_pair$$${x[0]}`}>
                <td>{x[0]}</td>
                <td>{x[1]}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Button
          className="ml-auto poll-item-add"
          variant="primary"
          onClick={() => this.setState({ addPollItemClicked: true })}
        >
          <FaPlus style={{ margin: 'auto' }} />
        </Button>

        <VerticallyCenteredModal
          heading={`Add a key-value pair in '${this.state.name}'`}
          show={this.state.addPollItemClicked}
          onHide={() => this.setState({ addPollItemClicked: false, addError: null })}>

          <Form className="d-flex flex-column">

            <Form.Group as={Row}>
              <Form.Label column sm="3">Action </Form.Label>
              <Col sm={9}>
                <Form.Control as="select" ref="task">
                  <option>Add</option>
                  <option>Remove</option>
                </Form.Control>
              </Col>
            </Form.Group>

            <Form.Group as={Row}>
              <Form.Label column sm={3}>
                Key name
              </Form.Label>

              <Col sm={9}>
                <Form.Control
                  type="text"
                  placeholder="Key here"
                  ref="keyName"
                  isInvalid={this.state.addError !== null}
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row}>
              <Form.Label column sm={3}>
                Value name
              </Form.Label>

              <Col sm={9}>
                <Form.Control
                  type="text"
                  placeholder="Value here"
                  ref="valueName"
                  isInvalid={this.state.addError !== null}
                />
              </Col>
            </Form.Group>

            <Form.Control.Feedback type="invalid">
              {this.state.addError}
            </Form.Control.Feedback>

            <Button
              variant="outline-success"
              type="submit"
              onClick={this.addPollItem}
              className="ml-auto"
            >
              Proceed
            </Button>
          </Form>

        </VerticallyCenteredModal>

      </div>
    );
  }
}

export default Display;