import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import {
  Panel,
  FormGroup,
  ControlLabel,
  Radio,
  ButtonToolbar,
  Button,
  Alert
} from 'react-bootstrap';

import { checkWeb3 } from '../../utils/blockchainHelpers';
import RegexInput from '../RegexInput';
import TierSetup from '../TierSetup';
export default inject(
  'contractStore',
  'crowdsaleBlockListStore',
  'pricingStrategyStore',
  'web3Store',
  'tierStore',
  'generalStore',
  'gasPriceStore',
  'reservedTokenStore',
  'deploymentStore',
  'tokenStore'
)(
  observer(
    class CrowdsaleSetup extends Component {
      constructor(props) {
        super(props);
        const {
          contractStore,
          crowdsaleBlockListStore,
          tierStore,
          gasPriceStore
        } = props;
        this.handleChange = this.handleChange.bind(this);
        this.state = {
          addr: '',
          min: '0',
          gasPriceSelected: gasPriceStore.slow.id,
          isError: false,
          isLoading: true
        };
      }
      componentDidMount() {
        const { tierStore, web3Store, gasPriceStore } = this.props;
        const { curAddress } = web3Store;

        gasPriceStore
          .updateValues()
          .then(() =>
            this.setState({ gasPriceSelected: gasPriceStore.slow.id })
          )
          .catch(() => console.log('NO Gas'))
          .then(() => this.setState({ loading: false }));
      }

      handleChange(e) {
        this.setState({ [e.id]: e.value }, () => {});
      }
      render() {
        const state = this.state;
        const gasPriceStore = this.props.gasPriceStore;
        return (
          <div>
            <Panel>
              <Panel.Heading>Global Setting</Panel.Heading>
              <Panel.Body>
                <form>
                  <RegexInput
                    id="addr"
                    title="Wallet Address"
                    value={state.addr}
                    type="text"
                    regex="^(0x)?[0-9a-fA-Z]{40}$"
                    help="Where the money goes after investors transactions. Immediately after each transaction. We recommend to setup a multisig wallet with hardware based signers."
                    onValueUpdate={this.handleChange}
                  />
                  <FormGroup>
                    <ControlLabel>Gas Price:</ControlLabel>
                    <Radio name="gas">{gasPriceStore.slowDescription}</Radio>
                    <Radio name="gas">
                      {gasPriceStore.standardDescription}
                    </Radio>
                    <Radio name="gas">{gasPriceStore.fastDescription}</Radio>
                  </FormGroup>
                  <RegexInput
                    id="min"
                    title="INVESTOR MIN CAP"
                    value={state.min}
                    type="number"
                    regex="^(([0-9]*)|(([0-9]*)\.([0-9]*)))$"
                    help="Minimum amount tokens to buy. Not a minimal size of a transaction. If minCap is 1 and user bought 1 token in a previous transaction and buying 0.1 token it will allow him to buy."
                    onValueUpdate={this.handleChange}
                  />
                  <FormGroup>
                    <ControlLabel>whitelisting:</ControlLabel>
                    <Radio name="whitelisting">Yes</Radio>
                    <Radio name="whitelisting">No</Radio>
                  </FormGroup>
                </form>
              </Panel.Body>
            </Panel>
            <TierSetup />
            <ButtonToolbar>
              <Button bsStyle="primary">Add Tier</Button>
              <Button bsStyle="primary">Continue</Button>
            </ButtonToolbar>
          </div>
        );
      }
    }
  )
);
