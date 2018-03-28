import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import RegexInput from '../RegexInput';
import ReservedTokenInputBlock from '../ReservedTokenInputBlock';
import { Button } from 'react-bootstrap';

export default inject(
  'tokenStore',
  'web3Store',
  'tierCrowdsaleListStore',
  'reservedTokenStore'
)(
  observer(
    class TokenSetup extends Component {
      constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.render = this.render.bind(this);

        this.state = {
          name: props.tokenStore.name || '',
          ticker: props.tokenStore.ticker || '',
          decimals: props.tokenStore.decimals || '',
          reservedTokenStore: props.reservedTokenStore
        };
      }
      updateTokenStore = (value, property) => {
        this.props.tokenStore.setProperty(property, value);
        this.props.tokenStore.validateTokens(property);
      };

      handleChange(e) {
        this.setState({ [e.id]: e.value }, () => {
          this.updateTokenStore(e.value, e.id);
        });
      }
      addReservedTokensItem = newToken => {
        this.props.reservedTokenStore.addToken(newToken);
      };
      removeReservedToken = index => {
        this.props.reservedTokenStore.removeToken(index);
      };

      render() {
        const state = this.state;
        const props = this.props;
        return (
          <div>
            <form>
              <RegexInput
                id="name"
                title="Name"
                value={state.name}
                type="text"
                regex="^.*\S.*"
                help="The name of your token. Will be used by Etherscan and other token browsers. Be afraid of trademarks."
                onValueUpdate={this.handleChange}
              />
              <RegexInput
                id="ticker"
                title="Ticker"
                value={state.ticker}
                type="text"
                regex="^.{5}$"
                help="The five letter ticker for your token. There are 11,881,376 combinations for 26 english letters. Be hurry."
                onValueUpdate={this.handleChange}
              />
              <RegexInput
                id="decimals"
                title="Decimals"
                value={state.decimals}
                type="number"
                regex="^([1-9]|1[0-9])$"
                help="Refers to how divisible a token can be, from 0 (not at all divisible) to 18 (pretty much continuous)."
                onValueUpdate={this.handleChange}
              />
              <ReservedTokenInputBlock
                title="Reserved Token Setup"
                data={state.reservedTokenStore.tokens}
                addReservedTokensItem={this.addReservedTokensItem}
                removeReservedToken={this.removeReservedToken}
              />
              <Button
                id="add-button"
                bsStyle="primary"
                disabled={!props.tokenStore.isTokenValid}
              >
                {!props.tokenStore.isTokenValid ? 'Invalid' : 'Continue'}
              </Button>
            </form>
          </div>
        );
      }
    }
  )
);
