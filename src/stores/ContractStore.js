import { observable, action, decorate } from 'mobx';
import autosave from './autosave';

class ContractStore {
  name;
  token;
  crowdsale;
  pricingStrategy;
  multisig;
  nullFinalizeAgent;
  finalizeAgent;
  tokenTransferProxy;
  safeMathLib;
  registry;
  contractType;

  constructor() {
    autosave(this, 'ContractStore');
  }

  setContract = (contractName, contractObj) => {
    this[contractName] = contractObj;
  };

  setContractType = contractType => {
    this.contractType = contractType;
  };

  setContractProperty = (contractName, property, value) => {
    let newContract = Object.assign({}, this[contractName]);
    newContract[property] = value;
    this[contractName] = newContract;
  };
}

decorate(ContractStore, {
  name: observable,
  token: observable,
  crowdsale: observable,
  pricingStrategy: observable,
  multisig: observable,
  nullFinalizeAgent: observable,
  finalizeAgent: observable,
  tokenTransferProxy: observable,
  safeMathLib: observable,
  registry: observable,
  contractType: observable,
  setContract: action,
  setContractType: action,
  setContractProperty: action
});

export default ContractStore;
