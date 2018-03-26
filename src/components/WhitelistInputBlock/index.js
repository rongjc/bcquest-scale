import React, { Component } from 'react';
import Web3Utils from 'web3-utils';
import { Panel, Table, Button } from 'react-bootstrap';
import RegexInput from '../RegexInput';
import { inject, observer } from 'mobx-react';

export default inject('tierStore')(
  observer(
    class WhitelistInputBlock extends Component {
      constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.addWhitelistItem = this.addWhitelistItem.bind(this);
        this.removeWhitelistItem = this.removeWhitelistItem.bind(this);
        this.clearInput = this.clearInput.bind(this);
        this.state = {
          data: this.props.data,
          title: this.props.title,
          num: this.props.num,
          isValid: false,
          addr: '',
          min: '',
          max: ''
        };
        console.log(props.data);
      }
      handleChange(e) {
        this.setState({ [e.id]: e.value }, () => {
          this.validate();
        });
      }
      addWhitelistItem() {
        const { tierStore } = this.props;
        const crowdsaleNum = this.props.num;
        const { addr, min, max } = this.state;

        // Todo: hard coded token for reserve
        this.clearInput();

        tierStore.addWhitelistItem({ addr, min, max }, crowdsaleNum);
      }
      clearInput() {
        this.setState({
          addr: '',
          min: '',
          max: ''
        });
      }
      removeWhitelistItem(index, e) {
        const { tierStore } = this.props;
        const crowdsaleNum = this.props.num;
        tierStore.removeWhitelistItem(index, crowdsaleNum);
      }

      validate() {
        this.setState({
          isValid:
            Web3Utils.isAddress(this.state.addr) &&
            this.isNumeric(this.state.min) &&
            this.isNumeric(this.state.max) &&
            parseFloat(this.state.min) <= parseFloat(this.state.max)
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
              <Panel.Body>
                <Table striped bordered condensed hover>
                  <thead>
                    <tr>
                      <th>ADDRESS</th>
                      <th>Min</th>
                      <th>Max</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {state.data.map((row, i) => {
                      return (
                        <tr key={i}>
                          <td>{row.addr}</td>
                          <td>{row.min}</td>
                          <td>{row.max}</td>
                          <td>
                            <Button
                              bsStyle="primary"
                              onClick={this.removeWhitelistItem.bind(this, i)}
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
                          id="min"
                          title=""
                          value={state.min}
                          type="number"
                          regex="^([1-9][0-9]*.?([0-9]*))$"
                          onValueUpdate={this.handleChange}
                        />
                      </td>
                      <td>
                        <RegexInput
                          id="max"
                          title=""
                          value={state.max}
                          type="number"
                          regex="^([1-9][0-9]*.?([0-9]*))$"
                          onValueUpdate={this.handleChange}
                        />
                      </td>
                      <td>
                        <Button
                          bsStyle="primary"
                          disabled={!this.state.isValid}
                          onClick={this.addWhitelistItem}
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
  )
);
