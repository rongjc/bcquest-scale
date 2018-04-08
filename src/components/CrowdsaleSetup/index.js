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
import {
  defaultCompanyStartDate,
  defaultCompanyEndDate
} from '../../utils/utils';
import {
  setExistingContractParams,
  getNetworkVersion,
  getNetWorkNameById
} from '../../utils/blockchainHelpers';
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
        const { contractStore, tierStore, gasPriceStore } = props;

        this.handleChange = this.handleChange.bind(this);
        this.updateWhitelistEnabled = this.updateWhitelistEnabled.bind(this);
        this.removeTier = this.removeTier.bind(this);

        tierStore.emptyList();

        if (tierStore.tiers.length === 0) {
          this.addCrowdsaleData(0);
          this.updateTierStore('no', 'whitelistEnabled', 0);
        }
        this.state = {
          addr: '',
          minCap: '0',
          gasPriceSelected: gasPriceStore.slow.id,
          isError: false,
          isLoading: true
        };
        if (contractStore.crowdsale.addr.length > 0) {
          contractStore.setContractProperty('pricingStrategy', 'addr', []);
          setExistingContractParams(
            contractStore.abi,
            contractStore.addr[0],
            contractStore.setContractProperty
          );
        }
      }
      beforeNavigate = e => {
        const { tierStore, gasPriceStore } = this.props;
        const gasPriceIsValid =
          gasPriceStore.custom.id !== this.state.gasPriceSelected ||
          this.state.validation.gasPrice.valid === VALID;
        const isMinCapValid = tierStore.globalMinCap <= tierStore.maxSupply;
        const { reservedTokenStore, deploymentStore } = this.props;
        const tiersCount = tierStore.tiers.length;
        const reservedCount = reservedTokenStore.tokens.length;
        const hasWhitelist = tierStore.tiers[0].whitelistEnabled === 'yes';
        e.preventDefault();
        e.stopPropagation();

        deploymentStore.initialize(!!reservedCount, hasWhitelist, tiersCount);
        this.props.history.push('/crowdsalestep4');
      };
      updateTierStore = (value, property, index) => {
        const { tierStore } = this.props;
        tierStore.setTierProperty(value, property, index);
        tierStore.validateTiers(property, index);
      };

      updateWhitelistEnabled = e => {
        this.updateTierStore(e.target.value, 'whitelistEnabled', 0);
      };

      componentDidMount() {
        const { tierStore, web3Store, gasPriceStore } = this.props;
        const { curAddress } = web3Store;

        tierStore.setTierProperty(curAddress, 'walletAddress', 0);

        gasPriceStore
          .updateValues()
          .then(() => {
            this.setState({ gasPriceSelected: gasPriceStore.slow.id });
            this.setGasPrice(gasPriceStore.slow);
          })
          .catch(() => console.log('NO Gas'))
          .then(() => this.setState({ loading: false }));
      }

      addCrowdsale() {
        const { tierStore } = this.props;
        let num = tierStore.tiers.length;

        this.addCrowdsaleData(num);
      }

      removeTier(index) {
        this.props.tierStore.removeTier(index);
      }
      addCrowdsaleData(num) {
        const { tierStore } = this.props;
        var startTime = defaultCompanyStartDate();

        if (num !== 0) {
          startTime = tierStore.tiers[num - 1].endTime;
        }
        var endTime = defaultCompanyEndDate(startTime);
        const newTier = {
          tier: 'Tier ' + (num + 1),
          supply: 1,
          rate: 1,
          startTime: startTime,
          endTime: endTime,
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
      }
      setGasPrice({ id, price }) {
        this.setState({
          gasPriceSelected: id
        });
        this.props.generalStore.setGasPrice(price);
      }
      handleChange(e) {
        this.setState({ [e.id]: e.value }, () => {});
        if (e.id === 'minCap') {
          this.props.tierStore.setGlobalMinCap(e.value);
        } else if (e.id === 'addr') {
          this.updateTierStore(e.value, 'walletAddress', 0);
        }
      }
      render() {
        const state = this.state;
        const gasPriceStore = this.props.gasPriceStore;
        const props = this.props;
        return (
          <div>
            <Panel>
              <Panel.Body>
                <div>
                  <h3 class="box-header">Crowdsale Setup</h3>
                </div>
                <div className="box-body">
                  <div className="row">
                    <div className="col-md-12">
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
                              <Radio
                                name="gas"
                                onChange={() =>
                                  this.setGasPrice(gasPriceStore.slow)
                                }
                                checked={
                                  state.gasPriceSelected ===
                                  gasPriceStore.slow.id
                                }
                              >
                                {gasPriceStore.slowDescription}
                              </Radio>
                              <Radio
                                name="gas"
                                onChange={() =>
                                  this.setGasPrice(gasPriceStore.standard)
                                }
                                checked={
                                  state.gasPriceSelected ===
                                  gasPriceStore.standard.id
                                }
                              >
                                {gasPriceStore.standardDescription}
                              </Radio>
                              <Radio
                                name="gas"
                                onChange={() =>
                                  this.setGasPrice(gasPriceStore.fast)
                                }
                                checked={
                                  state.gasPriceSelected ===
                                  gasPriceStore.fast.id
                                }
                              >
                                {gasPriceStore.fastDescription}
                              </Radio>
                            </FormGroup>
                            <RegexInput
                              id="min"
                              title="INVESTOR MIN CAP"
                              value={state.minCap}
                              type="number"
                              disabled={
                                props.tierStore.tiers[0].whitelistEnabled ===
                                'yes'
                              }
                              regex="^(([0-9]*)|(([0-9]*)\.([0-9]*)))$"
                              help="Minimum amount tokens to buy. Not a minimal size of a transaction. If minCap is 1 and user bought 1 token in a previous transaction and buying 0.1 token it will allow him to buy."
                              onValueUpdate={this.handleChange}
                            />
                            <FormGroup
                              onChange={e => this.updateWhitelistEnabled(e)}
                            >
                              <ControlLabel>whitelisting:</ControlLabel>
                              <Radio
                                name="whitelisting"
                                value="yes"
                                checked={
                                  props.tierStore.tiers[0].whitelistEnabled ===
                                  'yes'
                                }
                              >
                                Yes
                              </Radio>
                              <Radio
                                name="whitelisting"
                                value="no"
                                checked={
                                  props.tierStore.tiers[0].whitelistEnabled ===
                                  'no'
                                }
                              >
                                No
                              </Radio>
                            </FormGroup>
                          </form>
                        </Panel.Body>
                      </Panel>
                      {props.tierStore.tiers.map((row, i) => {
                        if (i === 0) {
                          return (
                            <TierSetup
                              key={i}
                              num={i}
                              removeTier={this.removeTier}
                            />
                          );
                        } else {
                          return (
                            <TierSetup
                              key={i}
                              num={i}
                              removable={true}
                              removeTier={this.removeTier}
                            />
                          );
                        }
                      })}
                    </div>
                  </div>
                </div>
                <div class="box-footer">
                  <ButtonToolbar>
                    <Button
                      bsStyle="primary"
                      onClick={() => this.addCrowdsale()}
                    >
                      Add Tier
                    </Button>
                    <Button
                      bsStyle="primary"
                      href={'crowdsalestep4'}
                      onClick={e => this.beforeNavigate(e)}
                    >
                      Continue
                    </Button>
                  </ButtonToolbar>
                </div>
              </Panel.Body>
            </Panel>
          </div>
        );
      }
    }
  )
);
