import { observable, action, computed, decorate } from 'mobx';
import { validateName, validateTicker } from '../utils/utils';
import { VALIDATION_TYPES } from '../utils/constants';
import autosave from './autosave';
const { EMPTY, VALID, INVALID } = VALIDATION_TYPES;

class TokenStore {
  name;
  ticker;
  supply;
  decimals;
  validToken;
  reservedTokensInput;
  reservedTokens;

  constructor() {
    this.reset();
    autosave(this, 'TokenStore');
  }

  reset = () => {
    this.name = undefined;
    this.ticker = undefined;
    this.supply = 0;
    this.decimals = undefined;
    this.validToken = {
      name: EMPTY,
      ticker: EMPTY,
      decimals: EMPTY
    };
    this.reservedTokensInput = {};
    this.reservedTokens = [];
  };

  setProperty = (property, value) => {
    this[property] = value;
  };

  validateTokens = property => {
    if (property === 'name') {
      this.validToken[property] = validateName(this.name) ? VALID : INVALID;
    } else if (property === 'ticker') {
      this.validToken[property] = validateTicker(this.ticker) ? VALID : INVALID;
    }
  };

  updateValidity = (property, validity) => {
    this.validToken[property] = validity;
  };

  invalidateToken = () => {
    if (!this.validToken) {
      return;
    }

    Object.keys(this.validToken).forEach(key => {
      if (this.validToken[key] === EMPTY) {
        this.validToken[key] = INVALID;
      }
    });
  };

  // Getters
  get isTokenValid() {
    if (!this.validToken) {
      return;
    }

    const validKeys = Object.keys(this.validToken).filter(key => {
      if (this.validToken[key] === VALID) {
        return true;
      } else {
        return false;
      }
    });
    return validKeys.length === Object.keys(this.validToken).length;
  }
}

decorate(TokenStore, {
  name: observable,
  ticker: observable,
  supply: observable,
  decimals: observable,
  validToken: observable,
  reservedTokensInput: observable,
  reservedTokens: observable,
  reset: action,
  setProperty: action,
  updateValidity: action,
  invalidateToken: action,
  validateTokens: action,
  isTokenValid: computed
});
export default TokenStore;
