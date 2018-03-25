import { observable, action, decorate } from 'mobx';
import autosave from './autosave';

export default class PricingStrategyStore {
  strategies;

  constructor(strategies = []) {
    this.strategies = strategies;

    autosave(this, 'PricingStrategyStore');
  }

  addStrategy = strategy => {
    this.strategies.push(strategy);
  };

  setStrategyProperty = (value, property, index) => {
    let newStrategy = { ...this.strategies[index] };
    newStrategy[property] = value;
    this.strategies[index] = newStrategy;
  };

  removeStrategy = index => {
    this.strategies.splice(index, 1);
  };
}
decorate(PricingStrategyStore, {
  strategies: observable,
  addStrategy: action,
  setStrategyProperty: action,
  removeStrategy: action
});
