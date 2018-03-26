import storage from 'store2';
import ContractStore from './ContractStore';
import PricingStrategyStore from './PricingStrategyStore';
import ReservedTokenStore from './ReservedTokenStore';
import TierStore from './TierStore';
import TokenStore from './TokenStore';
import Web3Store from './Web3Store';
import TierCrowdsaleListStore from './TierCrowdsaleListStore';
import CrowdsaleBlockListStore from './CrowdsaleBlockListStore';
import GeneralStore from './GeneralStore';
import CrowdsalePageStore from './CrowdsalePageStore';
import InvestStore from './InvestStore';
import CrowdsaleStore from './CrowdsaleStore';
import GasPriceStore from './GasPriceStore';
import DeploymentStore from './DeploymentStore';

// Clear local storage if there is no incomplete deployment
if (
  storage.has('DeploymentStore') &&
  storage.get('DeploymentStore').deploymentStep === null
) {
  // localStorage.clear();
}

const generalStore = new GeneralStore();
const crowdsalePageStore = new CrowdsalePageStore();
const tierCrowdsaleListStore = new TierCrowdsaleListStore();
const crowdsaleBlockListStore = new CrowdsaleBlockListStore();
const contractStore = new ContractStore();
const pricingStrategyStore = new PricingStrategyStore();
const reservedTokenStore = new ReservedTokenStore();
const tierStore = new TierStore();
const tokenStore = new TokenStore();
const web3Store = new Web3Store();
const investStore = new InvestStore();
const crowdsaleStore = new CrowdsaleStore();
const gasPriceStore = new GasPriceStore();
const deploymentStore = new DeploymentStore();

export {
  generalStore,
  crowdsalePageStore,
  tierCrowdsaleListStore,
  crowdsaleBlockListStore,
  contractStore,
  pricingStrategyStore,
  reservedTokenStore,
  tierStore,
  tokenStore,
  web3Store,
  investStore,
  crowdsaleStore,
  gasPriceStore,
  deploymentStore
};
