import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Panel, Button, Col } from 'react-bootstrap';
import { gweiToWei, weiToGwei } from '../../utils/utils';

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
        const { tierStore, gasPriceStore } = props;
        this.handleChange = this.handleChange.bind(this);
        this.removeTier = this.removeTier.bind(this);
        const num = parseInt(props.num, 10);

        this.state = {
          tier: tierStore.tiers[num].tier,
          startTime: tierStore.tiers[num].startTime,
          endTime: tierStore.tiers[num].endTime,
          rate: tierStore.tiers[num].rate,
          supply: tierStore.tiers[num].supply,
          gasPriceSelected: gasPriceStore.slow.id,
          isError: false,
          isLoading: true
        };
      }
      componentDidMount() {}
      removeTier(index, e) {
        console.log(index);
        this.props.removeTier(index);
      }
      handleChange(e) {
        this.setState({ [e.id]: e.value }, () => {});
        const num = parseInt(this.props.num, 10);
        const tierStore = this.props.tierStore;
        tierStore.setTierProperty(e.value, e.id, num);
      }
      componentWillReceiveProps(newProps) {
        const num = parseInt(newProps.num, 10);
        const { tierStore, gasPriceStore } = newProps;
        this.setState({
          tier: tierStore.tiers[num].tier,
          startTime: tierStore.tiers[num].startTime,
          endTime: tierStore.tiers[num].endTime,
          rate: tierStore.tiers[num].rate,
          supply: tierStore.tiers[num].supply,
          gasPriceSelected: gasPriceStore.slow.id,
          isError: false,
          isLoading: true
        });
      }

      render() {
        const state = this.state;
        const props = this.props;
        const { tierStore } = this.props;
        const num = parseInt(props.num, 10);
        return (
          <div>
            <Panel>
              <Panel.Heading>Tier Setup</Panel.Heading>
              <Panel.Body>
                <form>
                  <RegexInput
                    id="tier"
                    title="Name"
                    value={state.tier}
                    type="text"
                    regex="^[0-9a-fA-Z]*"
                    help="Name of a tier, e.g. PrePreCrowdsale, PreCrowdsale, Crowdsale with bonus A, Crowdsale with bonus B, etc. We simplified that and will increment a number after each tier."
                    onValueUpdate={this.handleChange}
                  />

                  <RegexInput
                    id="startTime"
                    title="START TIME"
                    value={state.startTime}
                    type="text"
                    regex="^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d$"
                    help="
                    Date and time when the tier starts. Can't be in the past from the current moment."
                    onValueUpdate={this.handleChange}
                  />
                  <RegexInput
                    id="endTime"
                    title="END TIME"
                    value={state.endTime}
                    type="text"
                    regex="^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d$"
                    help="
                    Date and time when the tier ends. Can be only in the future."
                    onValueUpdate={this.handleChange}
                  />
                  <RegexInput
                    id="rate"
                    title="Rate"
                    value={state.rate}
                    type="number"
                    regex="^(([0-9]*)|(([0-9]*)\.([0-9]*)))$"
                    help="
                    Exchange rate Ethereum to Tokens. If it's 100, then for 1 Ether you can buy 100 tokens"
                    onValueUpdate={this.handleChange}
                  />
                  <RegexInput
                    id="supply"
                    title="Supply"
                    value={state.supply}
                    type="number"
                    regex="^(([0-9]*)|(([0-9]*)\.([0-9]*)))$"
                    help="How many tokens will be sold on this tier. Cap of crowdsale equals to sum of supply of all tiers"
                    onValueUpdate={this.handleChange}
                  />
                </form>

                {tierStore.tiers[0].whitelistEnabled === 'yes' ? (
                  <WhitelistInputBlock
                    data={props.tierStore.tiers[num].whitelistElements}
                    num={num}
                  />
                ) : (
                  ''
                )}
                {props.removable ? (
                  <Button
                    bsStyle="primary"
                    onClick={this.removeTier.bind(this, num)}
                  >
                    Remove Tier
                  </Button>
                ) : (
                  ''
                )}
              </Panel.Body>
            </Panel>
          </div>
        );
      }
    }
  )
);
