import { observable, action, decorate } from 'mobx';
import autosave from './autosave';

export default class TierCrowdsaleListStore {
  crowdsaleList;

  constructor(crowdsaleList = []) {
    this.crowdsaleList = crowdsaleList;

    autosave(this, 'TierCrowdsaleListStore');
  }

  addCrowdsaleItem = crowdsaleItem => {
    this.crowdsaleList.push(crowdsaleItem);
  };

  setCrowdsaleItemProperty = (index, property, value) => {
    let newCrowdsaleItem = { ...this.crowdsaleList[index] };
    newCrowdsaleItem[property] = value;
    this.crowdsaleList[index] = newCrowdsaleItem;
  };

  removeCrowdsaleItem = index => {
    this.crowdsaleList.splice(index, 1);
  };
}
decorate(TierCrowdsaleListStore, {
  crowdsaleList: observable,
  addCrowdsaleItem: action,
  setCrowdsaleItemProperty: action,
  removeCrowdsaleItem: action
});
