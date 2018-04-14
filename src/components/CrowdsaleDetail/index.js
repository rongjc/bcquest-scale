import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import {
  Panel,
  FormControl,
  FormGroup,
  ControlLabel,
  Button
} from 'react-bootstrap';
import { isObservableArray } from 'mobx';
import { Link } from 'react-router-dom';
import {
  CONTRACT_TYPES,
  TEXT_FIELDS,
  TOAST,
  VALIDATION_MESSAGES,
  DESCRIPTION
} from '../../utils/constants';
import {
  successfulFinalizeAlert,
  successfulDistributeAlert,
  successfulUpdateCrowdsaleAlert,
  warningOnFinalizeCrowdsale,
  notTheOwner
} from '../../utils/alerts';
import {
  getNetworkVersion,
  sendTXToContract,
  attachToContract,
  calculateGasLimit
} from '../../utils/blockchainHelpers';
import { toast } from '../../utils/utils';
import { getWhiteListWithCapCrowdsaleAssets } from '../../stores/utils';
import { getTiers, processTier, updateTierAttribute } from './utils';

const {
  START_TIME,
  END_TIME,
  RATE,
  SUPPLY,
  WALLET_ADDRESS,
  CROWDSALE_SETUP_NAME
} = TEXT_FIELDS;

export default inject(
  'crowdsaleStore',
  'web3Store',
  'tierStore',
  'contractStore',
  'generalStore',
  'tokenStore',
  'gasPriceStore'
)(
  observer(
    class CrowdsaleDetail extends Component {
      constructor(props) {
        super(props);
        this.state = {
          formPristine: true,
          loading: true,
          canFinalize: false,
          canDistribute: false,
          shouldDistribute: false,
          ownerCurrentUser: true
        };
      }
      componentWillMount() {
        const {
          crowdsaleStore,
          contractStore,
          generalStore,
          match
        } = this.props;
        const crowdsaleAddress = match.params.crowdsaleAddress;
        console.log(crowdsaleAddress);
        crowdsaleStore.setSelectedProperty('address', crowdsaleAddress);

        // networkID
        getNetworkVersion().then(networkId =>
          generalStore.setProperty('networkId', networkId)
        );

        // contractType
        contractStore.setContractType(CONTRACT_TYPES.whitelistwithcap);

        getWhiteListWithCapCrowdsaleAssets().then(this.extractContractData);
      }

      distributeReservedTokens = addressesPerBatch => {
        this.updateCrowdsaleStatus()
          .then(() => {
            const { crowdsaleStore } = this.props;

            if (
              !crowdsaleStore.selected.distributed &&
              this.state.canDistribute
            ) {
              const { contractStore } = this.props;
              const lastCrowdsaleAddress = contractStore.crowdsale.addr.slice(
                -1
              )[0];

              return attachToContract(
                contractStore.crowdsale.abi,
                lastCrowdsaleAddress
              )
                .then(crowdsaleContract =>
                  Promise.all([
                    crowdsaleContract,
                    crowdsaleContract.methods.token().call()
                  ])
                )
                .then(([crowdsaleContract, token]) => {
                  attachToContract(contractStore.token.abi, token).then(
                    tokenContract => {
                      tokenContract.methods
                        .reservedTokensDestinationsLen()
                        .call()
                        .then(reservedTokensDestinationsLen => {
                          const batchesLen = Math.ceil(
                            reservedTokensDestinationsLen / addressesPerBatch
                          );
                          const distributeMethod = crowdsaleContract.methods.distributeReservedTokens(
                            addressesPerBatch
                          );

                          let opts = {
                            gasPrice: this.props.generalStore.gasPrice
                          };
                          let batches = Array.from(Array(batchesLen).keys());
                          this.distributeReservedTokensRecursive(
                            batches,
                            distributeMethod,
                            opts
                          )
                            .then(() => {
                              successfulDistributeAlert();
                              crowdsaleStore.setSelectedProperty(
                                'distributed',
                                true
                              );
                              return this.updateCrowdsaleStatus();
                            })
                            .catch(err => {
                              console.log(err);
                              toast.showToaster({
                                type: TOAST.TYPE.ERROR,
                                message: TOAST.MESSAGE.DISTRIBUTE_FAIL
                              });
                            })
                            .then(this.hideLoader);
                        });
                    }
                  );
                });
            }
          })
          .catch(console.error);
      };
      updateCrowdsaleStatus = () => {
        return this.setCrowdsaleInfo()
          .then(this.shouldDistribute)
          .then(this.canDistribute)
          .then(this.canFinalize)
          .then(this.checkOwner);
      };
      setCrowdsaleInfo = () => {
        const { contractStore, crowdsaleStore } = this.props;
        const lastCrowdsaleAddress = contractStore.crowdsale.addr.slice(-1)[0];

        return attachToContract(
          contractStore.crowdsale.abi,
          lastCrowdsaleAddress
        )
          .then(crowdsaleContract => crowdsaleContract.methods.endsAt().call())
          .then(crowdsaleEndTime =>
            this.setState({
              crowdsaleHasEnded:
                crowdsaleEndTime * 1000 <= Date.now() ||
                crowdsaleStore.selected.finalized
            })
          );
      };
      extractContractData = () => {
        const { contractStore, crowdsaleStore } = this.props;

        getTiers(crowdsaleStore.selected.address)
          .then(joinedCrowdsales => {
            contractStore.setContractProperty(
              'crowdsale',
              'addr',
              joinedCrowdsales
            );

            if (!contractStore.crowdsale.addr) {
              this.hideLoader();
              return Promise.reject('no tiers addresses');
            }
          })
          .then(() => {
            return contractStore.crowdsale.addr.reduce(
              (promise, addr, index) => {
                return promise.then(() => processTier(addr, index));
              },
              Promise.resolve()
            );
          })
          .then(this.updateCrowdsaleStatus)
          .catch(console.log)
          .then(this.hideLoader);
      };
      checkOwner = () => {
        const { contractStore, web3Store } = this.props;

        return attachToContract(
          contractStore.crowdsale.abi,
          contractStore.crowdsale.addr[0]
        )
          .then(crowdsaleContract => {
            const whenOwner = crowdsaleContract.methods.owner().call();
            const whenAccounts = web3Store.web3.eth.getAccounts();

            return Promise.all([whenOwner, whenAccounts]);
          })
          .then(([ownerAccount, accounts]) =>
            this.setState({ ownerCurrentUser: accounts[0] === ownerAccount })
          )
          .then(() => {
            if (!this.state.ownerCurrentUser) {
              notTheOwner();
            }
          });
      };
      canDistribute = () => {
        const { contractStore, match } = this.props;

        return new Promise(resolve => {
          attachToContract(
            contractStore.crowdsale.abi,
            match.params.crowdsaleAddress
          ).then(crowdsaleContract => {
            // eslint-disable-line no-loop-func
            console.log('attach to crowdsale contract');

            if (!crowdsaleContract)
              return Promise.reject('No contract available');

            crowdsaleContract.methods
              .canDistributeReservedTokens()
              .call((err, canDistributeReservedTokens) => {
                return canDistributeReservedTokens;
              })
              .then(canDistributeReservedTokens => {
                console.log(
                  '#canDistributeReservedTokens:',
                  canDistributeReservedTokens
                );
                this.setState({ canDistribute: canDistributeReservedTokens });
                resolve(this.state.canDistribute);
              })
              .catch(() => {
                this.setState({ canDistribute: false });
                resolve(this.state.canDistribute);
              });
          });
        });
      };
      finalizeCrowdsale = () => {
        this.updateCrowdsaleStatus()
          .then(() => {
            const { crowdsaleStore } = this.props;

            if (!crowdsaleStore.selected.finalized && this.state.canFinalize) {
              warningOnFinalizeCrowdsale().then(result => {
                if (result.value) {
                  this.showLoader();

                  let opts = {
                    gasPrice: this.props.generalStore.gasPrice
                  };

                  const { contractStore } = this.props;
                  const lastCrowdsaleAddress = contractStore.crowdsale.addr.slice(
                    -1
                  )[0];

                  return attachToContract(
                    contractStore.crowdsale.abi,
                    lastCrowdsaleAddress
                  )
                    .then(crowdsaleContract =>
                      crowdsaleContract.methods.finalize()
                    )
                    .then(finalizeMethod =>
                      Promise.all([
                        finalizeMethod,
                        finalizeMethod.estimateGas(opts)
                      ])
                    )
                    .then(([finalizeMethod, estimatedGas]) => {
                      opts.gasLimit = calculateGasLimit(estimatedGas);
                      return sendTXToContract(finalizeMethod.send(opts));
                    })
                    .then(() => {
                      crowdsaleStore.setSelectedProperty('finalized', true);
                      this.setState({ canFinalize: false }, () => {
                        successfulFinalizeAlert().then(() => {
                          this.setState({ loading: true });
                          setTimeout(() => window.location.reload(), 500);
                        });
                      });
                    })
                    .catch(err => {
                      console.log(err);
                      toast.showToaster({
                        type: TOAST.TYPE.ERROR,
                        message: TOAST.MESSAGE.FINALIZE_FAIL
                      });
                    })
                    .then(this.hideLoader);
                }
              });
            }
          })
          .catch(console.error);
      };
      readOnlyWhitelistedAddresses = tier => {
        if (!tier.whitelist.length) {
          return <div>No address loaded</div>;
        }

        return tier.whitelist.map(item => (
          <div key={item.addr}>
            <FormGroup>
              <ControlLabel>Address</ControlLabel>
              <FormControl type="text" value={item.addr} disabled />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Min</ControlLabel>
              <FormControl type="text" value={item.min} disabled />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Max</ControlLabel>
              <FormControl type="text" value={item.max} disabled />
            </FormGroup>
          </div>
        ));
      };

      renderWhitelistInputBlock = (tier, index) => {
        const { crowdsaleStore, tierStore } = this.props;

        if (tierStore.tiers[0].whitelistEnabled !== 'yes') {
          return null;
        }

        return (
          <Panel>
            <Panel.Heading>
              <Panel.Title>Whitelist</Panel.Title>
            </Panel.Heading>
            <Panel.Body>readOnlyWhitelistedAddresses(tier)</Panel.Body>
          </Panel>
        );
      };

      saveCrowdsale = e => {
        this.showLoader();

        e.preventDefault();
        e.stopPropagation();

        this.updateCrowdsaleStatus()
          .then(() => {
            const { crowdsaleStore, tierStore } = this.props;
            const updatableTiers = crowdsaleStore.selected.initialTiersValues.filter(
              tier => tier.updatable
            );
            const isValidTier = tierStore.individuallyValidTiers;
            const validTiers = updatableTiers.every(
              tier => isValidTier[tier.index]
            );

            if (
              !this.state.formPristine &&
              !this.state.crowdsaleHasEnded &&
              updatableTiers.length &&
              validTiers
            ) {
              const keys = Object.keys(updatableTiers[0]).filter(
                key =>
                  key !== 'index' &&
                  key !== 'updatable' &&
                  key !== 'addresses' &&
                  key !== 'whitelistElements'
              );

              updatableTiers
                .reduce((toUpdate, tier) => {
                  keys.forEach(key => {
                    const { addresses } = tier;
                    let newValue = tierStore.tiers[tier.index][key];

                    if (isObservableArray(newValue)) {
                      if (newValue.length > tier[key].length) {
                        newValue = newValue
                          .slice(tier[key].length)
                          .filter(whitelist => !whitelist.deleted);
                        if (newValue.length) {
                          toUpdate.push({ key, newValue, addresses });
                        }
                      }
                    } else if (newValue !== tier[key]) {
                      toUpdate.push({ key, newValue, addresses });
                    }
                  });
                  return toUpdate;
                }, [])
                .reduce((promise, { key, newValue, addresses }) => {
                  return promise.then(() =>
                    updateTierAttribute(key, newValue, addresses)
                  );
                }, Promise.resolve())
                .then(() => {
                  this.hideLoader();
                  successfulUpdateCrowdsaleAlert();
                })
                .catch(err => {
                  console.log(err);
                  this.hideLoader();
                  toast.showToaster({
                    type: TOAST.TYPE.ERROR,
                    message: TOAST.MESSAGE.TRANSACTION_FAILED
                  });
                });
            } else {
              this.hideLoader();
            }
          })
          .catch(error => {
            console.error(error);
            this.hideLoader();
          });
      };

      canFinalize = () => {
        const { contractStore } = this.props;
        const lastCrowdsaleAddress = contractStore.crowdsale.addr.slice(-1)[0];

        return attachToContract(
          contractStore.crowdsale.abi,
          lastCrowdsaleAddress
        )
          .then(crowdsaleContract => {
            const whenIsFinalized = crowdsaleContract.methods
              .finalized()
              .call();
            const whenIsCrowdsaleFull = crowdsaleContract.methods
              .isCrowdsaleFull()
              .call();

            return Promise.all([whenIsFinalized, whenIsCrowdsaleFull]);
          })
          .then(
            ([isFinalized, isCrowdsaleFull]) => {
              if (isFinalized) {
                this.setState({ canFinalize: false });
              } else {
                const {
                  crowdsaleHasEnded,
                  shouldDistribute,
                  canDistribute
                } = this.state;
                const wasDistributed = shouldDistribute && !canDistribute;

                this.setState({
                  canFinalize:
                    (crowdsaleHasEnded || isCrowdsaleFull) &&
                    (wasDistributed || !shouldDistribute)
                });
              }
            },
            () => this.setState({ canFinalize: false })
          );
      };

      shouldDistribute = () => {
        const { contractStore, match } = this.props;

        return new Promise(resolve => {
          attachToContract(
            contractStore.crowdsale.abi,
            match.params.crowdsaleAddress
          ).then(crowdsaleContract => {
            // eslint-disable-line no-loop-func
            console.log('attach to crowdsale contract');

            if (!crowdsaleContract)
              return Promise.reject('No contract available');

            crowdsaleContract.methods
              .token()
              .call()
              .then(tokenAddress =>
                attachToContract(contractStore.token.abi, tokenAddress)
              )
              .then(tokenContract =>
                tokenContract.methods.reservedTokensDestinationsLen().call()
              )
              .then(reservedTokensDestinationsLen => {
                if (reservedTokensDestinationsLen > 0)
                  this.setState({ shouldDistribute: true });
                else this.setState({ shouldDistribute: false });
                resolve(this.state.shouldDistribute);
              })
              .catch(() => {
                this.setState({ shouldDistribute: false });
                resolve(this.state.shouldDistribute);
              });
          });
        });
      };

      render() {
        const {
          formPristine,
          canFinalize,
          shouldDistribute,
          canDistribute,
          crowdsaleHasEnded,
          ownerCurrentUser
        } = this.state;
        const {
          generalStore,
          tierStore,
          tokenStore,
          crowdsaleStore
        } = this.props;
        const {
          address: crowdsaleAddress,
          finalized,
          updatable
        } = crowdsaleStore.selected;

        const distributeBlock = (
          <Panel>
            <Panel.Heading>
              <Panel.Title>DISTRIBUTE RESERVED TOKENS</Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              <p>
                Reserved tokens distribution is the last step of the crowdsale
                before finalization. You can make it after the end of the last
                tier or if hard cap is reached. If you reserved more then 100
                addresses for your crowdsale, the distribution will be executed
                in batches with 100 reserved addresses per batch. Amount of
                batches is equal to amount of transactions
              </p>
              <Button
                bsStyle="primary"
                onClick={() => this.distributeReservedTokens(100)}
                disabled={!(ownerCurrentUser && canDistribute)}
              >
                Distribute
              </Button>
            </Panel.Body>
          </Panel>
        );

        const aboutStep = (
          <Panel>
            <Panel.Heading>
              <Panel.Title>Finalize Crowdsale</Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              <p>
                Finalize - Finalization is the last step of the crowdsale. You
                can make it only after the end of the last tier. After
                finalization, it's not possible to update tiers, buy tokens. All
                tokens will be movable, reserved tokens will be issued.
              </p>
              <Button
                bsStyle="primary"
                onClick={() => this.finalizeCrowdsale()}
                disabled={!(ownerCurrentUser && !finalized)}
              >
                Finalize
              </Button>
            </Panel.Body>
          </Panel>
        );
        const aboutTier = (
          <Panel>
            <Panel.Heading>
              <Panel.Title>
                {tokenStore.name} ({tokenStore.ticker})
              </Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              <p>
                The most important and exciting part of the crowdsale process.
                Here you can define parameters of your crowdsale campaign.
              </p>
              <Button
                bsStyle="primary"
                href={`/crowdsale/invest?addr=${crowdsaleAddress}&networkID=${
                  generalStore.networkId
                }`}
              >
                Invest
              </Button>
            </Panel.Body>
          </Panel>
        );
        return (
          <div>
            <section className="manage">
              {this.props.match.params.crowdsaleAddress}
            </section>
            {shouldDistribute ? distributeBlock : null}
            {aboutStep}
            {aboutTier}
            {tierStore.tiers.map((tier, index) => (
              <div key={index}>
                <Panel>
                  <Panel.Heading>
                    <Panel.Title>{tier.name}</Panel.Title>
                  </Panel.Heading>
                  <Panel.Body>
                    <form>
                      <FormGroup>
                        <ControlLabel>{CROWDSALE_SETUP_NAME}</ControlLabel>
                        <FormControl type="text" value={tier.name} disabled />
                      </FormGroup>
                      <FormGroup>
                        <ControlLabel>{WALLET_ADDRESS}</ControlLabel>
                        <FormControl
                          type="text"
                          value={tier.walletAddress}
                          disabled
                        />
                      </FormGroup>
                      <FormGroup>
                        <ControlLabel>{START_TIME}</ControlLabel>
                        <FormControl
                          type="text"
                          value={tier.startTime}
                          disabled
                        />
                      </FormGroup>
                      <FormGroup>
                        <ControlLabel>{END_TIME}</ControlLabel>
                        <FormControl
                          type="text"
                          value={tier.endTime}
                          disabled
                        />
                      </FormGroup>
                      <FormGroup>
                        <ControlLabel>{RATE}</ControlLabel>
                        <FormControl type="text" value={tier.rate} disabled />
                      </FormGroup>
                      <FormGroup>
                        <ControlLabel>{SUPPLY}</ControlLabel>
                        <FormControl type="text" value={tier.supply} disabled />
                      </FormGroup>
                    </form>
                    {this.renderWhitelistInputBlock(tier, index)}
                  </Panel.Body>
                </Panel>
              </div>
            ))}
          </div>
        );
      }
    }
  )
);
