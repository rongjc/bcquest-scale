import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { isObservableArray } from 'mobx';
import { Link } from 'react-router-dom';
import {
  CONTRACT_TYPES,
  TEXT_FIELDS,
  TOAST,
  VALIDATION_MESSAGES,
  DESCRIPTION
} from '../../utils/constants';
import {
  successfulFinalizeAlert,
  successfulDistributeAlert,
  successfulUpdateCrowdsaleAlert,
  warningOnFinalizeCrowdsale,
  notTheOwner
} from '../../utils/alerts';
import {
  getNetworkVersion,
  sendTXToContract,
  attachToContract,
  calculateGasLimit
} from '../../utils/blockchainHelpers';
import { toast } from '../../utils/utils';
import { getWhiteListWithCapCrowdsaleAssets } from '../../stores/utils';
import { getTiers, processTier, updateTierAttribute } from './utils';

const {
  START_TIME,
  END_TIME,
  RATE,
  SUPPLY,
  WALLET_ADDRESS,
  CROWDSALE_SETUP_NAME
} = TEXT_FIELDS;

export default inject(
  'crowdsaleStore',
  'web3Store',
  'tierStore',
  'contractStore',
  'generalStore',
  'tokenStore',
  'gasPriceStore'
)(
  observer(
    class CrowdsaleDetail extends Component {
      constructor(props) {
        super(props);
        this.state = {
          formPristine: true,
          loading: true,
          canFinalize: false,
          canDistribute: false,
          shouldDistribute: false,
          ownerCurrentUser: true
        };
      }

      render() {
        return <section className="manage">test</section>;
      }
    }
  )
);
