import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  Panel,
  FormGroup,
  ControlLabel,
  FormControl,
  Alert,
  Table,
  ButtonToolbar,
  DropdownButton,
  MenuItem,
  Radio,
  Button
} from 'react-bootstrap';
import { loadRegistryAddresses } from '../../utils/blockchainHelpers';
import { inject, observer } from 'mobx-react';
import {
  invalidCrowdsaleAddrAlert,
  investmentDisabledAlertInTime,
  noGasPriceAvailable,
  noMetaMaskAlert,
  successfulInvestmentAlert
} from '../../utils/alerts';
import QRPaymentProcess from './QRPaymentProcess';
import { getWhiteListWithCapCrowdsaleAssets } from '../../stores/utils';
import {
  CONTRACT_TYPES,
  INVESTMENT_OPTIONS,
  TOAST
} from '../../utils/constants';
import {
  findCurrentContractRecursively,
  getAccumulativeCrowdsaleData,
  getContractStoreProperty,
  getCrowdsaleData,
  getCrowdsaleTargetDates,
  getCurrentRate,
  getJoinedTiers,
  initializeAccumulativeData
} from '../Crowdsale/utils';
import {
  checkNetWorkByID,
  checkTxMined,
  sendTXToContract
} from '../../utils/blockchainHelpers';
import { countDecimalPlaces, getQueryVariable, toast } from '../../utils/utils';

export const CrowdsaleConfig = {};
export default inject(
  'contractStore',
  'crowdsalePageStore',
  'web3Store',
  'tierStore',
  'tokenStore',
  'generalStore',
  'investStore',
  'gasPriceStore',
  'generalStore'
)(
  observer(
    class invest extends Component {
      constructor(props) {
        super(props);

        this.state = {
          seconds: 0,
          loading: true,
          pristineTokenInput: true,
          web3Available: false,
          investThrough: INVESTMENT_OPTIONS.QR,
          crowdsaleAddress:
            CrowdsaleConfig.crowdsaleContractURL || getQueryVariable('addr')
        };
        this.investToTokens = this.investToTokens.bind(this);
      }

      componentDidMount() {
        const {
          web3Store,
          contractStore,
          gasPriceStore,
          generalStore
        } = this.props;
        const { web3 } = web3Store;

        if (!web3) {
          this.setState({ loading: false });
          return;
        }

        const networkID = CrowdsaleConfig.networkID
          ? CrowdsaleConfig.networkID
          : getQueryVariable('networkID');
        const contractType = CONTRACT_TYPES.whitelistwithcap;
        checkNetWorkByID(networkID);
        contractStore.setContractType(contractType);

        const timeInterval = setInterval(
          () => this.setState({ seconds: this.state.seconds - 1 }),
          1000
        );
        this.setState({
          timeInterval,
          web3Available: true,
          investThrough: INVESTMENT_OPTIONS.METAMASK
        });

        getWhiteListWithCapCrowdsaleAssets().then(_newState => {
          this.setState(_newState);
          this.extractContractsData();
          gasPriceStore
            .updateValues()
            .then(() => generalStore.setGasPrice(gasPriceStore.slow.price))
            .catch(() => noGasPriceAvailable());
        });
      }

      extractContractsData() {
        const { contractStore, crowdsalePageStore, web3Store } = this.props;
        const { web3 } = web3Store;

        const crowdsaleAddr = CrowdsaleConfig.crowdsaleContractURL
          ? CrowdsaleConfig.crowdsaleContractURL
          : getQueryVariable('addr');

        if (!web3.utils.isAddress(crowdsaleAddr)) {
          this.setState({ loading: false });
          return invalidCrowdsaleAddrAlert();
        }

        getJoinedTiers(
          contractStore.crowdsale.abi,
          crowdsaleAddr,
          [],
          joinedCrowdsales => {
            console.log('joinedCrowdsales:', joinedCrowdsales);

            const crowdsaleAddrs =
              typeof joinedCrowdsales === 'string'
                ? [joinedCrowdsales]
                : joinedCrowdsales;
            contractStore.setContractProperty(
              'crowdsale',
              'addr',
              crowdsaleAddrs
            );

            web3.eth.getAccounts().then(accounts => {
              if (accounts.length === 0) {
                this.setState({ loading: false });
                return;
              }

              this.setState({
                curAddr: accounts[0],
                web3
              });

              if (!contractStore.crowdsale.addr) {
                this.setState({ loading: false });
                return;
              }

              findCurrentContractRecursively(0, null, crowdsaleContract => {
                if (!crowdsaleContract) {
                  this.setState({ loading: false });
                  return;
                }

                initializeAccumulativeData()
                  .then(() => getCrowdsaleData(crowdsaleContract))
                  .then(() => getAccumulativeCrowdsaleData())
                  .then(() => this.setState({ loading: false }))
                  .catch(err => {
                    this.setState({ loading: false });
                    console.log(err);
                  });

                getCrowdsaleTargetDates(this, () => {
                  if (crowdsalePageStore.endDate) {
                    this.setState({
                      seconds:
                        (crowdsalePageStore.endDate - new Date().getTime()) /
                        1000
                    });
                  }
                });
              });
            });
          }
        );
      }
      shouldStopCountDown() {
        if (this.state.seconds < 0) {
          this.setState({ seconds: 0 });
          clearInterval(this.state.timeInterval);
        }
      }
      getTimeStamps(seconds) {
        this.shouldStopCountDown();
        const days = Math.floor(seconds / 24 / 60 / 60);
        const hoursLeft = Math.floor(seconds - days * 86400);
        const hours = Math.floor(hoursLeft / 3600);
        const minutesLeft = Math.floor(hoursLeft - hours * 3600);
        const minutes = Math.floor(minutesLeft / 60);
        return { days, hours, minutes };
      }
      togglePayment(e) {
        this.setState({ investThrough: e });
      }

      investToTokens(event) {
        const { investStore, crowdsalePageStore, web3Store } = this.props;
        const { web3 } = web3Store;
        console.log(event);
        event.preventDefault();

        if (!this.isValidToken(investStore.tokensToInvest)) {
          this.setState({ pristineTokenInput: false });
          return;
        }

        this.setState({ loading: true });

        const startBlock = parseInt(crowdsalePageStore.startBlock, 10);
        const { startDate } = crowdsalePageStore;

        if ((isNaN(startBlock) || startBlock === 0) && !startDate) {
          this.setState({ loading: false });
          return;
        }

        if (web3.eth.accounts.length === 0) {
          this.setState({ loading: false });
          return noMetaMaskAlert();
        }

        this.investToTokensForWhitelistedCrowdsale();
      }
      investToTokensForWhitelistedCrowdsale() {
        const { crowdsalePageStore, web3Store } = this.props;
        const { web3 } = web3Store;

        if (crowdsalePageStore.startDate > new Date().getTime()) {
          this.setState({ loading: false });
          return investmentDisabledAlertInTime(crowdsalePageStore.startDate);
        }

        findCurrentContractRecursively(
          0,
          null,
          (crowdsaleContract, tierNum) => {
            if (!crowdsaleContract) {
              this.setState({ loading: false });
              return;
            }

            getCurrentRate(crowdsaleContract)
              .then(() => web3.eth.getAccounts())
              .then(accounts =>
                this.investToTokensForWhitelistedCrowdsaleInternal(
                  crowdsaleContract,
                  tierNum,
                  accounts
                )
              )
              .catch(console.log);
          }
        );
      }
      investToTokensForWhitelistedCrowdsaleInternal(
        crowdsaleContract,
        tierNum,
        accounts
      ) {
        const {
          contractStore,
          tokenStore,
          crowdsalePageStore,
          investStore,
          generalStore
        } = this.props;

        let nextTiers = [];
        for (
          let i = tierNum + 1;
          i < contractStore.crowdsale.addr.length;
          i++
        ) {
          nextTiers.push(contractStore.crowdsale.addr[i]);
        }
        console.log('nextTiers:', nextTiers);
        console.log(nextTiers.length);

        const decimals = parseInt(tokenStore.decimals, 10);
        console.log('decimals:', decimals);

        const rate = parseInt(crowdsalePageStore.rate, 10); //it is from contract. It is already in wei. How much 1 token costs in wei.
        console.log('rate:', rate);

        const tokensToInvest = parseFloat(investStore.tokensToInvest);
        console.log('tokensToInvest:', tokensToInvest);

        const weiToSend = parseInt(tokensToInvest * rate, 10);
        console.log('weiToSend:', weiToSend);

        const opts = {
          from: accounts[0],
          value: weiToSend,
          gasPrice: generalStore.gasPrice
        };
        console.log(opts);

        crowdsaleContract.methods
          .buy()
          .estimateGas(opts)
          .then(estimatedGas => {
            const estimatedGasMax = 4016260;
            opts.gasLimit =
              !estimatedGas || estimatedGas > estimatedGasMax
                ? estimatedGasMax
                : estimatedGas + 100000;

            return sendTXToContract(crowdsaleContract.methods.buy().send(opts));
          })
          .then(() => successfulInvestmentAlert(investStore.tokensToInvest))
          .catch(err =>
            toast.showToaster({
              type: TOAST.TYPE.ERROR,
              message: TOAST.MESSAGE.TRANSACTION_FAILED
            })
          )
          .then(() => this.setState({ loading: false }));
      }

      isValidToken(token) {
        return (
          +token > 0 &&
          countDecimalPlaces(token) <= this.props.tokenStore.decimals
        );
      }
      tokensToInvestOnChange(event) {
        this.setState({ pristineTokenInput: false });
        this.props.investStore.setProperty(
          'tokensToInvest',
          event.target.value
        );
      }
      render() {
        const {
          crowdsalePageStore,
          tokenStore,
          contractStore,
          investStore
        } = this.props;
        const { rate, tokenAmountOf, ethRaised, supply } = crowdsalePageStore;
        const { crowdsale, contractType } = contractStore;
        const { tokensToInvest } = investStore;

        const {
          seconds,
          curAddr,
          pristineTokenInput,
          investThrough,
          crowdsaleAddress,
          web3Available
        } = this.state;
        const { days, hours, minutes } = this.getTimeStamps(seconds);

        const { decimals, ticker, name } = tokenStore;
        const isWhitelistWithCap =
          contractType === CONTRACT_TYPES.whitelistwithcap;

        const tokenDecimals = !isNaN(decimals) ? decimals : 0;
        const tokenTicker = ticker ? ticker.toString() : '';
        const tokenName = name ? name.toString() : '';
        const maxCapBeforeDecimals =
          crowdsalePageStore.maximumSellableTokens / 10 ** tokenDecimals;
        const tokenAddress = getContractStoreProperty('token', 'addr');

        //balance: tiers, standard
        const investorBalanceTiers = tokenAmountOf
          ? (tokenAmountOf / 10 ** tokenDecimals).toString()
          : '0';
        const investorBalanceStandard = ethRaised
          ? (ethRaised / rate).toString()
          : '0';
        const investorBalance = isWhitelistWithCap
          ? investorBalanceTiers
          : investorBalanceStandard;

        //total supply: tiers, standard
        const tierCap = !isNaN(maxCapBeforeDecimals)
          ? maxCapBeforeDecimals.toString()
          : '0';
        const standardCrowdsaleSupply = !isNaN(supply)
          ? supply.toString()
          : '0';
        const totalSupply = isWhitelistWithCap
          ? tierCap
          : standardCrowdsaleSupply;

        return (
          <div>
            <Panel>
              <Panel.Heading>
                <Panel.Title>CrowdSale</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <Alert bsStyle="danger" onDismiss={this.handleDismiss}>
                  <h4>
                    {days} days {hours} hours {minutes} mins left
                  </h4>
                </Alert>
                <form>
                  <FormGroup>
                    <ControlLabel>Current Account</ControlLabel>
                    <FormControl type="text" value={curAddr} disabled />
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>Token Address</ControlLabel>
                    <FormControl type="text" value={tokenAddress} disabled />
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>Crowdsale Contract Address</ControlLabel>
                    <FormControl
                      type="text"
                      value={crowdsaleAddress}
                      disabled
                    />
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>Name</ControlLabel>
                    <FormControl type="text" value={name} disabled />
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>Ticker</ControlLabel>
                    <FormControl type="text" value={ticker} disabled />
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>Total Supply</ControlLabel>
                    <FormControl type="text" value={totalSupply} disabled />
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>Time Left</ControlLabel>
                    <FormControl type="text" value={totalSupply} disabled />
                  </FormGroup>
                </form>
              </Panel.Body>
            </Panel>
            <Panel>
              <Panel.Heading>
                <Panel.Title>Invest</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <form>
                  <FormGroup>
                    <ControlLabel>Balance</ControlLabel>
                    <FormControl type="text" value={investorBalance} disabled />
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>Choose amount to invest</ControlLabel>
                    <FormControl
                      type="text"
                      value={tokensToInvest}
                      onChange={this.tokensToInvestOnChange}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Radio
                      name="paymentOption"
                      defaultChecked={
                        this.state.investThrough == INVESTMENT_OPTIONS.METAMASK
                      }
                      onClick={this.togglePayment.bind(
                        this,
                        INVESTMENT_OPTIONS.METAMASK
                      )}
                    >
                      METAMASK
                    </Radio>
                    <Radio
                      name="paymentOption"
                      defaultChecked={
                        this.state.investThrough == INVESTMENT_OPTIONS.QR
                      }
                      onClick={this.togglePayment.bind(
                        this,
                        INVESTMENT_OPTIONS.QR
                      )}
                    >
                      QR Code
                    </Radio>
                    {investThrough === INVESTMENT_OPTIONS.QR ? (
                      <QRPaymentProcess crowdsaleAddress={crowdsaleAddress} />
                    ) : (
                      <Button bsStyle="primary" onClick={this.investToTokens}>
                        Contribute
                      </Button>
                    )}
                  </FormGroup>
                </form>
              </Panel.Body>
            </Panel>
          </div>
        );
      }
    }
  )
);
