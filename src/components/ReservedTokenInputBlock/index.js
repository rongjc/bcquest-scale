import React, { Component } from 'react';
import Web3Utils from 'web3-utils';
import { Panel, Table, Button } from 'react-bootstrap';
import RegexInput from '../RegexInput';
import { observer } from 'mobx-react';

export default observer(
  class ReservedTokensInputBlock extends Component {
    constructor(props) {
      super(props);
      this.handleChange = this.handleChange.bind(this);
      this.addReservedTokensItem = this.addReservedTokensItem.bind(this);
      this.clearInput = this.clearInput.bind(this);
      this.state = {
        data: this.props.data,
        title: this.props.title,
        isValid: false,
        addr: '',
        value: ''
      };
    }
    handleChange(e) {
      this.setState({ [e.id]: e.value }, () => {
        this.validate();
      });
    }
    addReservedTokensItem() {
      const { addr, value } = this.state;

      // Todo: hard coded token for reserve
      this.clearInput();
      let newToken = {
        addr: addr,
        dim: 'tokens',
        val: value
      };

      this.props.addReservedTokensItem(newToken);
    }
    removeReservedToken(index, e) {
      this.props.removeReservedToken(index);
    }
    clearInput() {
      this.setState({
        addr: '',
        dim: 'tokens',
        value: ''
      });
    }

    validate() {
      this.setState({
        isValid:
          Web3Utils.isAddress(this.state.addr) &&
          this.isNumeric(this.state.value)
      });
    }
    isNumeric(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }
    render() {
      const state = this.state;
      const props = this.props;
      return (
        <div>
          <Panel>
            <Panel.Heading>
              <Panel.Title componentClass="h3">{props.title}</Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              <Table striped responsive>
                <thead>
                  <tr>
                    <th>ADDRESS</th>
                    <th>Value</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {state.data.map((row, i) => {
                    return (
                      <tr key={i}>
                        <td>{row.addr}</td>
                        <td>{row.val}</td>
                        <td>
                          <Button
                            bsStyle="primary"
                            onClick={this.removeReservedToken.bind(this, i)}
                          >
                            -
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td>
                      <RegexInput
                        id="addr"
                        title=""
                        value={state.addr}
                        type="text"
                        regex="^(0x)?[0-9a-fA-Z]{40}$"
                        onValueUpdate={this.handleChange}
                      />
                    </td>
                    <td>
                      <RegexInput
                        id="value"
                        title=""
                        value={state.value}
                        type="number"
                        regex="^([1-9][0-9]*.?([0-9]*))$"
                        onValueUpdate={this.handleChange}
                      />
                    </td>
                    <td>
                      <Button
                        bsStyle="primary"
                        disabled={!this.state.isValid}
                        onClick={this.addReservedTokensItem}
                      >
                        +
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Panel.Body>
          </Panel>
        </div>
      );
    }
  }
);
