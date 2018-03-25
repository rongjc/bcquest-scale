import { observable, action, decorate } from 'mobx';

export default class InvestStore {
  tokensToInvest;

  setProperty = (property, value) => {
    this[property] = value;
  };
}

decorate(InvestStore, {
  tokensToInvest: observable,
  setProperty: action
});
