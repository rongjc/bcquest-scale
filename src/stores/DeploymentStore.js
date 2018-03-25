import { action, computed, observable, decorate } from 'mobx';
import autosave from './autosave';

export default class DeploymentStore {
  txMap = new Map();
  deploymentStep = null;
  hasEnded = false;

  constructor() {
    autosave(this, 'DeploymentStore', store => {
      const txMap = new Map();
      Object.keys(store.txMap).forEach(key => {
        txMap.set(key, store.txMap[key]);
      });
      store.txMap = txMap;

      return store;
    });
  }

  initialize = (hasReservedToken, hasWhitelist, tiersCount) => {
    const listOfTx = [
      { name: 'safeMathLibrary', dependsOnTiers: false, required: true },
      { name: 'token', dependsOnTiers: false, required: true },
      { name: 'pricingStrategy', dependsOnTiers: true, required: true },
      { name: 'crowdsale', dependsOnTiers: true, required: true },
      {
        name: 'registerCrowdsaleAddress',
        dependsOnTiers: false,
        required: true
      },
      { name: 'finalizeAgent', dependsOnTiers: true, required: true },
      { name: 'tier', dependsOnTiers: true, required: true },
      {
        name: 'setReservedTokens',
        dependsOnTiers: false,
        required: hasReservedToken
      },
      { name: 'updateJoinedCrowdsales', dependsOnTiers: true, required: true },
      { name: 'setMintAgentCrowdsale', dependsOnTiers: true, required: true },
      {
        name: 'setMintAgentFinalizeAgent',
        dependsOnTiers: true,
        required: true
      },
      { name: 'whitelist', dependsOnTiers: true, required: hasWhitelist },
      { name: 'setFinalizeAgent', dependsOnTiers: true, required: true },
      { name: 'setReleaseAgent', dependsOnTiers: true, required: true },
      { name: 'transferOwnership', dependsOnTiers: false, required: true }
    ];
    const byTierInitialValues = new Array(tiersCount).fill(false);

    listOfTx.forEach(tx => {
      if (tx.required) {
        if (tx.dependsOnTiers) {
          return this.txMap.set(tx.name, byTierInitialValues);
        }
        return this.txMap.set(tx.name, [false]);
      }
      this.txMap.set(tx.name, []);
    });
    this.logTxMap();
  };

  initializePersonalized = (
    hasReservedToken,
    hasWhitelist,
    tiersCount,
    listOfTx
  ) => {
    this.initialize(hasReservedToken, hasWhitelist, tiersCount);
    // TODO: based on listOfTx, modify this.txMap so it reflects the required amount of steps
  };

  setAsSuccessful = txName => {
    const txStatus = this.txMap.get(txName);
    const toBeUpdated = txStatus.findIndex(isSuccess => !isSuccess);

    if (toBeUpdated !== -1) {
      txStatus[toBeUpdated] = true;
      this.txMap.set(txName, txStatus);
    }

    this.logTxMap();
  };

  setDeploymentStep = index => {
    this.deploymentStep = index;
    console.log(this);
  };

  resetDeploymentStep = () => {
    this.deploymentStep = null;
  };

  setHasEnded(value) {
    this.hasEnded = value;
  }

  logTxMap = () => {
    if (process.env.NODE_ENV !== 'development') return;

    const table = [];

    this.txMap.forEach((txStatus, txName) => {
      const tiersStatuses = {};
      txStatus.forEach(
        (value, index) => (tiersStatuses[`Tier ${index + 1}`] = value)
      );
      table.push({ txName, ...tiersStatuses });
    });
  };

  get deploymentHasFinished() {
    let flag = true;
    this.txMap.forEach((value, key, map) => {
      if (value.slice()[0] === false) {
        flag = false;
      }
    });
    return flag;
  }

  get nextPendingTransaction() {
    // for (let [tx, txStatuses] of this.txMap) {
    //   if (txStatuses.some(status => !status)) return tx
    // }

    for (var key in this.txMap) {
      if (this.txMap.hasOwnProperty(key)) {
        console.log('next', this.txMap[key]);
        if (this.txMap[key].some(status => !status)) return key;
      }
    }
  }
}
decorate(DeploymentStore, {
  txMap: observable,
  deploymentStep: observable,
  hasEnded: observable,
  initialize: action,
  initializePersonalized: action,
  setAsSuccessful: action,
  setDeploymentStep: action,
  resetDeploymentStep: action,
  setHasEnded: action,
  deploymentHasFinished: computed,
  nextPendingTransaction: computed
});
