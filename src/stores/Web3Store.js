import Web3 from 'web3';
import { observable, decorate } from 'mobx';

export default class Web3Store {
  web3;
  curAddress;
  accounts;

  constructor(strategies) {
    this.getWeb3(web3 => {
      if (web3) {
        this.web3 = web3;
        web3.eth.getAccounts().then(accounts => {
          this.accounts = accounts;
          this.curAddress = accounts[0];
        });
      }
    });
  }

  getWeb3 = cb => {
    var web3 = window.web3;
    if (typeof web3 === 'undefined') {
      // no web3, use fallback
      console.error('Please use a web3 browser');
      const devEnvironment = process.env.NODE_ENV === 'development';
      if (devEnvironment) {
        web3 = new Web3(
          new Web3.providers.HttpProvider('http://localhost:8545')
        );
      }

      cb(web3, false);
    } else {
      // window.web3 == web3 most of the time. Don't override the provided,
      // web3, just wrap it in your Web3.
      var myWeb3 = new Web3(web3.currentProvider);
      cb(myWeb3, false);
    }
    return myWeb3;
  };
}

decorate(Web3Store, {
  web3: observable,
  curAddress: observable,
  accounts: observable
});
