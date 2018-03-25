import { observable, action, decorate } from 'mobx';
import { GAS_PRICE } from '../utils/constants';
import autosave from './autosave';

export default class GeneralStore {
  networkId;
  gasPrice = GAS_PRICE.FAST.PRICE;

  constructor() {
    autosave(this, 'GeneralStore');
  }

  setProperty = (property, value) => {
    this[property] = value;
  };

  setGasPrice = gasPrice => {
    this.gasPrice = gasPrice;
  };
}
decorate(GeneralStore, {
  gasPrice: observable,
  networkId: observable,
  setProperty: action,
  setGasPrice: action
});
