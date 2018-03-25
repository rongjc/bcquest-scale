import ContractStore from './ContractStore';

describe('TokenStore', () => {
  var contractType1 = '1';
  var contractType2 = '2';
  var contractName = 'name';

  var contractStore = new ContractStore();

  it(`Check setContractType`, () => {
    contractStore.setContractType(contractType2);
    expect(contractStore.contractType).toEqual(contractType2);
  });
  it(`Check setProperty`, () => {
    contractStore.setContractType(contractName);
    expect(contractStore.contractType).toEqual(contractName);
  });
});
