import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import {
  Panel,
  FormGroup,
  ControlLabel,
  Radio,
  Button,
  Alert
} from 'react-bootstrap';

import { setFlatFileContentToState } from '../../utils/utils';
import { checkWeb3 } from '../../utils/blockchainHelpers';

import { DOWNLOAD_STATUS, CONTRACT_TYPES } from '../../utils/constants';

export default inject('contractStore', 'web3Store')(
  observer(
    class ContractSetup extends Component {
      constructor(props) {
        super(props);
        this.render = this.render.bind(this);

        this.state = {
          contractsDownloaded: DOWNLOAD_STATUS.PENDING,
          isError: false,
          isLoading: true
        };
      }
      getStandardCrowdsaleAssets() {
        return Promise.all([
          this.getCrowdsaleAsset('CrowdsaleStandard', 'crowdsale'),
          this.getCrowdsaleAsset('CrowdsaleStandardToken', 'token')
        ]);
      }

      getWhiteListWithCapCrowdsaleAssets() {
        return Promise.all([
          this.getCrowdsaleAsset('SafeMathLibExt', 'safeMathLib'),
          this.getCrowdsaleAsset('CrowdsaleWhiteListWithCap', 'crowdsale'),
          this.getCrowdsaleAsset('CrowdsaleWhiteListWithCapToken', 'token'),
          this.getCrowdsaleAsset(
            'CrowdsaleWhiteListWithCapPricingStrategy',
            'pricingStrategy'
          ),
          this.getCrowdsaleAsset(
            'CrowdsaleWhiteListWithCapPricingStrategy',
            'pricingStrategy'
          ),
          this.getCrowdsaleAsset('FinalizeAgent', 'finalizeAgent'),
          this.getCrowdsaleAsset('NullFinalizeAgent', 'nullFinalizeAgent'),
          this.getCrowdsaleAsset('Registry', 'registry')
        ]);
      }

      getCrowdsaleAsset(contractName, stateProp) {
        const src = setFlatFileContentToState(
          `/contracts/${contractName}_flat.sol`
        );
        const bin = setFlatFileContentToState(
          `/contracts/${contractName}_flat.bin`
        );
        const abi = setFlatFileContentToState(
          `/contracts/${contractName}_flat.abi`
        );

        return Promise.all([src, bin, abi]).then(result =>
          this.addContractsToState(...result, stateProp)
        );
      }
      componentDidMount() {
        checkWeb3();
        let downloadContracts = null;

        switch (this.props.contractStore.contractType) {
          case CONTRACT_TYPES.standard:
            downloadContracts = this.getStandardCrowdsaleAssets();
            break;
          case CONTRACT_TYPES.whitelistwithcap:
            downloadContracts = this.getWhiteListWithCapCrowdsaleAssets();
            break;
          default:
            break;
        }
        downloadContracts = this.getWhiteListWithCapCrowdsaleAssets();
        downloadContracts.then(
          () => {
            this.setState({
              contractsDownloaded: DOWNLOAD_STATUS.SUCCESS,
              isLoading: false
            });
          },
          e => {
            console.error('Error downloading contracts', e);
            this.setState({
              contractsDownloaded: DOWNLOAD_STATUS.FAILURE,
              isError: true
            });
          }
        );
      }
      addContractsToState(src, bin, abi, contract) {
        this.props.contractStore.setContract(contract, {
          src,
          bin,
          abi: JSON.parse(abi),
          addr:
            contract === 'crowdsale' ||
            contract === 'pricingStrategy' ||
            contract === 'finalizeAgent'
              ? []
              : '',
          abiConstructor:
            contract === 'crowdsale' ||
            contract === 'pricingStrategy' ||
            contract === 'finalizeAgent'
              ? []
              : ''
        });
      }
      render() {
        const { isLoading, isError } = this.state;
        return (
          <div>
            {isError ? (
              <Alert bsStyle="danger" onDismiss={this.handleDismiss}>
                <h4>Error loading contract template</h4>
                <p>Error loading contract template, please retry</p>
              </Alert>
            ) : (
              ''
            )}
            <Panel>
              <Panel.Body>
                <div>
                  <h3 class="box-header">Contract Setup</h3>
                </div>
                <div className="box-body">
                  <div className="row">
                    <div className="col-md-12">
                      <form>
                        <FormGroup>
                          <ControlLabel>
                            Choose your crowdsale type
                          </ControlLabel>
                          <Radio checked readOnly>
                            Whitelist with Cap
                          </Radio>
                        </FormGroup>
                      </form>
                    </div>
                  </div>
                </div>
                <div class="box-footer">
                  <Button bsStyle="primary" disabled={isLoading}>
                    {isLoading ? 'Loading template...' : 'Continue'}
                  </Button>
                </div>
              </Panel.Body>
            </Panel>
          </div>
        );
      }
    }
  )
);

// inject("contractStore", "web3Store")(observer(CrowdSalePage));
