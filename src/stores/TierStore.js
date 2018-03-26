import { observable, action, computed, decorate } from 'mobx';
import { VALIDATION_TYPES, defaultTiers } from '../utils/constants';
import {
  validateName,
  validateTime,
  validateSupply,
  validateRate,
  validateAddress,
  validateLaterTime,
  validateLaterOrEqualTime,
  validateTier
} from '../utils/utils';
import autosave from './autosave';
const { VALID, INVALID } = VALIDATION_TYPES;

export default class TierStore {
  tiers;
  validTiers;
  globalMinCap = '';

  constructor() {
    this.reset();
    autosave(this, 'TierStore');
    console.log(this);
  }

  reset = () => {
    this.tiers = defaultTiers.slice();
    this.validTiers = [
      {
        name: 'VALIDATED',
        walletAddress: 'VALIDATED',
        rate: 'EMPTY',
        supply: 'EMPTY',
        startTime: 'VALIDATED',
        endTime: 'VALIDATED',
        updatable: 'VALIDATED'
      }
    ];
  };

  setGlobalMinCap = minCap => {
    this.globalMinCap = minCap;
  };

  addTier = tier => {
    this.tiers.push(tier);
  };

  addTierValidations = validations => {
    this.validTiers.push(validations);
  };

  setTierProperty = (value, property, index) => {
    let newTier = { ...this.tiers[index] };
    newTier[property] = value;
    this.tiers[index] = newTier;
  };

  removeTier = index => {
    this.tiers.splice(index, 1);
  };

  emptyList = () => {
    this.tiers = [];
  };

  emptyTierValidationsList = () => {
    this.validTiers = [];
  };

  validateTiers = (property, index) => {
    switch (property) {
      case 'name':
        this.validTiers[index][property] = validateName(
          this.tiers[index][property]
        )
          ? VALID
          : INVALID;
        break;
      case 'tier':
        this.validTiers[index][property] = validateTier(
          this.tiers[index][property]
        )
          ? VALID
          : INVALID;
        break;
      case 'walletAddress':
        this.validTiers[index][property] = validateAddress(
          this.tiers[index][property]
        )
          ? VALID
          : INVALID;
        break;
      case 'supply':
        this.validTiers[index][property] = validateSupply(
          this.tiers[index][property]
        )
          ? VALID
          : INVALID;
        break;
      case 'rate':
        this.validTiers[index][property] = validateRate(
          this.tiers[index][property]
        )
          ? VALID
          : INVALID;
        break;
      case 'startTime':
        if (index > 0) {
          console.log(this.tiers);
          this.validTiers[index][property] = validateLaterOrEqualTime(
            this.tiers[index][property],
            this.tiers[index - 1].endTime
          )
            ? VALID
            : INVALID;
        } else {
          this.validTiers[index][property] = validateTime(
            this.tiers[index][property]
          )
            ? VALID
            : INVALID;
        }
        break;
      case 'endTime':
        this.validTiers[index][property] = validateLaterTime(
          this.tiers[index][property],
          this.tiers[index].startTime
        )
          ? VALID
          : INVALID;
        break;
      default:
      // do nothing
    }
  };

  validateEditedTier = (property, index) => {
    switch (property) {
      case 'endTime':
        let lessThanNextStart = true;
        const laterTime = validateLaterTime(
          this.tiers[index][property],
          this.tiers[index].startTime
        );

        if (index < this.tiers.length - 1) {
          lessThanNextStart = validateLaterOrEqualTime(
            this.tiers[index + 1].startTime,
            this.tiers[index][property]
          );
        }

        this.validTiers[index][property] =
          lessThanNextStart && laterTime ? VALID : INVALID;
        break;
      case 'startTime':
        let notLaterTime = true;
        const previousToEndTime = validateLaterTime(
          this.tiers[index].endTime,
          this.tiers[index][property]
        );
        const validTime = validateTime(this.tiers[index][property]);

        if (index > 0) {
          notLaterTime = validateLaterOrEqualTime(
            this.tiers[index][property],
            this.tiers[index - 1].endTime
          );
        }

        this.validTiers[index][property] =
          notLaterTime && previousToEndTime && validTime ? VALID : INVALID;
        break;
      default:
      // Nothing
    }
  };

  validateEditedEndTime = index => {
    if (this.tiers.length) {
      if (index < this.tiers.length - 1) {
        this.validTiers[index].endTime = validateLaterOrEqualTime(
          this.tiers[index + 1].startTime,
          this.tiers[index].endTime
        )
          ? VALID
          : INVALID;
      }
    }
  };

  get individuallyValidTiers() {
    if (!this.validTiers) return;

    return this.validTiers.map((tier, index) =>
      Object.keys(tier).every(key => this.validTiers[index][key] === VALID)
    );
  }

  get areTiersValid() {
    if (!this.validTiers) {
      return;
    }

    const isValid = this.validTiers.every((tier, index) => {
      return Object.keys(tier).every(key => {
        console.log('key', key, this.validTiers[index][key]);
        return this.validTiers[index][key] === VALID;
      });
    });

    console.log('isValid', isValid);

    return isValid;
  }

  invalidateToken = () => {
    if (!this.validTiers) {
      return;
    }
    this.validTiers.forEach((tier, index) => {
      Object.keys(tier).forEach(key => {
        if (this.validTiers[index][key] === 'EMPTY') {
          this.validTiers[index][key] = 'INVALID';
        }
      });
    });
  };

  addWhitelistItem = ({ addr, min, max }, crowdsaleNum) => {
    const tier = this.tiers[crowdsaleNum];

    const whitelist = tier.whitelist;

    const whitelistElements = tier.whitelistElements;

    const whitelistNum = whitelistElements.length;

    whitelistElements.push({ addr, min, max, whitelistNum, crowdsaleNum });
    whitelist.push({ addr, min, max });
  };

  removeWhitelistItem = (whitelistNum, crowdsaleNum) => {
    let whitelist = this.tiers[crowdsaleNum].whitelist;
    let whitelistElements = this.tiers[crowdsaleNum].whitelistElements;

    whitelist = whitelist.splice(whitelistNum, 1);
    whitelistElements = whitelistElements.splice(whitelistNum, 1);
  };

  get maxSupply() {
    return this.tiers
      .map(tier => +tier.supply)
      .reduce((a, b) => Math.max(a, b), 0);
  }
}

decorate(TierStore, {
  tiers: observable,
  validTiers: observable,
  globalMinCap: observable,
  invalidateToken: action,
  emptyList: action,
  removeTier: action,
  setTierProperty: action,
  addTierValidations: action,
  addTier: action,
  setGlobalMinCap: action,
  reset: action,
  emptyTierValidationsList: action,
  validateTiers: action,
  validateEditedTier: action,
  validateEditedEndTime: action,
  addWhitelistItem: action,
  removeWhitelistItem: action,
  areTiersValid: computed,
  individuallyValidTiers: computed,
  maxSupply: computed
});
