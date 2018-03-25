import { observable, action, decorate } from 'mobx';
import autosave from './autosave';

export default class CrowdsaleBlockListStore {
  blockList;

  constructor(blockList = []) {
    this.blockList = blockList;
    autosave(this, 'CrowdsaleBlockListStore');
  }

  addCrowdsaleItem = crowdsaleBlock => {
    // todo: this is giving warnings and the remove part is not working properly
    this.blockList.push(crowdsaleBlock);
  };

  setCrowdsaleItemProperty = (index, property, value) => {
    let newCrowdsaleItem = { ...this.blockList[index] };
    newCrowdsaleItem[property] = value;
    this.blockList[index] = newCrowdsaleItem;
  };

  removeCrowdsaleItem = index => {
    this.blockList.splice(index, 1);
  };

  emptyList = () => {
    this.blockList = [];
  };
}

decorate(CrowdsaleBlockListStore, {
  blockList: observable,
  emptyList: action,
  removeCrowdsaleItem: action,
  addCrowdsaleItem: action,
  setCrowdsaleItemProperty: action
});
