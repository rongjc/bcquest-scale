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
import WhitelistInputBlock from '../WhitelistInputBlock';

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
    class TierSetup extends Component {
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
      componentDidMount() {}

      handleChange(e) {
        this.setState({ [e.id]: e.value }, () => {});
      }
      render() {
        const state = this.state;
        const props = this.props;
        const gasPriceStore = this.props.gasPriceStore;
        return (
          <div>
            <Panel>
              <Panel.Heading>Tier Setup</Panel.Heading>
              <Panel.Body>
                <form>
                  <RegexInput
                    id="name"
                    title="Name"
                    value="Name"
                    type="text"
                    regex="^(0x)?[0-9a-fA-Z]{40}$"
                    help="Name of a tier, e.g. PrePreCrowdsale, PreCrowdsale, Crowdsale with bonus A, Crowdsale with bonus B, etc. We simplified that and will increment a number after each tier."
                    onValueUpdate={this.handleChange}
                  />
                  <RegexInput
                    id="startTime"
                    title="START TIME"
                    value="Start Tiem"
                    type="text"
                    regex="^(([0-9]*)|(([0-9]*)\.([0-9]*)))$"
                    help="
                    Date and time when the tier starts. Can't be in the past from the current moment."
                    onValueUpdate={this.handleChange}
                  />
                  <RegexInput
                    id="endTime"
                    title="END TIME"
                    value="End Tiem"
                    type="text"
                    regex="^(([0-9]*)|(([0-9]*)\.([0-9]*)))$"
                    help="
                    Date and time when the tier ends. Can be only in the future."
                    onValueUpdate={this.handleChange}
                  />
                  <RegexInput
                    id="rate"
                    title="Rate"
                    value="Rate"
                    type="number"
                    regex="^(([0-9]*)|(([0-9]*)\.([0-9]*)))$"
                    help="
                    Exchange rate Ethereum to Tokens. If it's 100, then for 1 Ether you can buy 100 tokens"
                    onValueUpdate={this.handleChange}
                  />
                  <RegexInput
                    id="supply"
                    title="Supply"
                    value="Supply"
                    type="number"
                    regex="^(([0-9]*)|(([0-9]*)\.([0-9]*)))$"
                    help="How many tokens will be sold on this tier. Cap of crowdsale equals to sum of supply of all tiers"
                    onValueUpdate={this.handleChange}
                  />
                </form>
              </Panel.Body>
            </Panel>
            <WhitelistInputBlock
              data={props.tierStore.tiers[0].whitelistElements}
              num="0"
            />
          </div>
        );
      }
    }
  )
);
