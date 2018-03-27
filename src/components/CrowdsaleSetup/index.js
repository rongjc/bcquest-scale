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

export const VALIDATION_TYPES = {
  VALID: 'VALIDATED',
  EMPTY: 'EMPTY',
  INVALID: 'INVALID'
};
const { EMPTY, VALID, INVALID } = VALIDATION_TYPES;
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
        this.updateWhitelistEnabled = this.updateWhitelistEnabled.bind(this);
        this.removeTier = this.removeTier.bind(this);

        tierStore.emptyList();
        crowdsaleBlockListStore.emptyList();

        tierStore.setTierProperty('Tier 1', 'tier', 0);
        tierStore.setTierProperty('off', 'updatable', 0);
        tierStore.setTierProperty('no', 'whitelistEnabled', 0);
        this.state = {
          addr: '',
          minCap: '0',
          gasPriceSelected: gasPriceStore.slow.id,
          isError: false,
          isLoading: true
        };
      }
      updateTierStore = (event, property, index) => {
        const { tierStore } = this.props;
        const value = event.target.value;
        tierStore.setTierProperty(value, property, index);
        tierStore.validateTiers(property, index);
      };

      updateWhitelistEnabled = e => {
        this.props.tierStore.setGlobalMinCap('');
        this.updateTierStore(e, 'whitelistEnabled', 0);
      };
      componentDidMount() {
        const { tierStore, web3Store, gasPriceStore } = this.props;
        const { curAddress } = web3Store;

        tierStore.setTierProperty(curAddress, 'walletAddress', 0);

        gasPriceStore
          .updateValues()
          .then(() =>
            this.setState({ gasPriceSelected: gasPriceStore.slow.id })
          )
          .catch(() => console.log('NO Gas'))
          .then(() => this.setState({ loading: false }));
      }

      addCrowdsale() {
        const { crowdsaleBlockListStore, tierStore } = this.props;
        let num = crowdsaleBlockListStore.blockList.length + 1;
        const newTier = {
          tier: 'Tier ' + (num + 1),
          supply: 0,
          rate: 0,
          updatable: 'off',
          whitelist: [],
          whitelistElements: []
        };
        const newTierValidations = {
          tier: VALID,
          startTime: VALID,
          endTime: VALID,
          supply: EMPTY,
          rate: EMPTY
        };

        tierStore.addTier(newTier);
        tierStore.addTierValidations(newTierValidations);

        this.addCrowdsaleBlock(num);
      }
      removeTier(index) {
        this.props.crowdsaleBlockListStore.removeCrowdsaleItem(index);
        this.props.tierStore.removeTier(index);
      }
      addCrowdsaleBlock(num) {
        this.props.crowdsaleBlockListStore.addCrowdsaleItem(
          <TierSetup
            num={num}
            key={num}
            removable={true}
            removeTier={this.removeTier}
          />
        );
      }

      handleChange(e) {
        this.setState({ [e.id]: e.value }, () => {});
      }
      render() {
        const state = this.state;
        const gasPriceStore = this.props.gasPriceStore;
        const {
          contractStore,
          crowdsaleBlockListStore,
          tierStore
        } = this.props;
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
                    value={state.minCap}
                    type="number"
                    disabled={tierStore.tiers[0].whitelistEnabled === 'yes'}
                    regex="^(([0-9]*)|(([0-9]*)\.([0-9]*)))$"
                    help="Minimum amount tokens to buy. Not a minimal size of a transaction. If minCap is 1 and user bought 1 token in a previous transaction and buying 0.1 token it will allow him to buy."
                    onValueUpdate={this.handleChange}
                  />
                  <FormGroup onChange={e => this.updateWhitelistEnabled(e)}>
                    <ControlLabel>whitelisting:</ControlLabel>
                    <Radio
                      name="whitelisting"
                      value="yes"
                      checked={
                        this.props.tierStore.tiers[0].whitelistEnabled === 'yes'
                      }
                    >
                      Yes
                    </Radio>
                    <Radio
                      name="whitelisting"
                      value="no"
                      checked={
                        this.props.tierStore.tiers[0].whitelistEnabled === 'no'
                      }
                    >
                      No
                    </Radio>
                  </FormGroup>
                </form>
              </Panel.Body>
            </Panel>
            <TierSetup key="0" num="0" />
            <div>{crowdsaleBlockListStore.blockList}</div>
            <ButtonToolbar>
              <Button bsStyle="primary" onClick={() => this.addCrowdsale()}>
                Add Tier
              </Button>
              <Button bsStyle="primary">Continue</Button>
            </ButtonToolbar>
          </div>
        );
      }
    }
  )
);
