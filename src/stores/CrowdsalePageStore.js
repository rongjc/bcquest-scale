import { observable, action, decorate } from 'mobx';

export default class CrowdsalePageStore {
  maximumSellableTokens;
  maximumSellableTokensInWei;
  investors;
  ethRaised;
  weiRaised;
  rate;
  tokensSold;
  tokenAmountOf;
  startBloc;
  endDate;

  setProperty = (property, value) => {
    this[property] = value;
  };
}

decorate(CrowdsalePageStore, {
  maximumSellableTokens: observable,
  maximumSellableTokensInWei: observable,
  investors: observable,
  ethRaised: observable,
  weiRaised: observable,
  rate: observable,
  tokensSold: observable,
  tokenAmountOf: observable,
  startBloc: observable,
  endDate: observable,
  setProperty: action
});
