import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

export default inject(
  'tokenStore',
  'web3Store',
  'tierCrowdsaleListStore',
  'reservedTokenStore'
)(
  observer(
    class TokenSetup extends Component {
      render() {
        return <div>Token Page</div>;
      }
    }
  )
);
