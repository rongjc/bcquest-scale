import { action, observable, decorate } from 'mobx';
import autosave from './autosave';

export default class CrowdsaleStore {
  crowdsales;
  maximumSellableTokens;
  maximumSellableTokensInWei;
  supply;
  selected;

  reset = () => {
    this.crowdsales = [];
    this.selected = {
      updatable: false,
      initialTiersValues: []
    };
  };

  constructor() {
    this.reset();
    autosave(this, 'CrowdsaleStore');
  }

  setCrowdsales = crowdsales => {
    this.crowdsales = crowdsales;
  };

  setProperty = (property, value) => {
    this[property] = value;
  };

  setSelectedProperty = (property, value) => {
    const currentCrowdsale = Object.assign({}, this.selected);

    currentCrowdsale[property] = value;
    this.selected = currentCrowdsale;
  };

  addInitialTierValues = initialValues => {
    this.selected.initialTiersValues.push(initialValues);
  };
}
decorate(CrowdsaleStore, {
  crowdsales: observable,
  maximumSellableTokens: observable,
  maximumSellableTokensInWei: observable,
  supply: observable,
  selected: observable,
  addInitialTierValues: action,
  setSelectedProperty: action,
  setProperty: action,
  setCrowdsales: action,
  reset: action
});
