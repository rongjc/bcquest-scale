import React, { Component } from 'react';
import {
  buildDeploymentSteps,
  download,
  getDownloadName,
  handleConstantForFile,
  handleContractsForFile,
  handlerForFile,
  scrollToBottom,
  setupContractDeployment
} from './utils';
import { CONTRACT_TYPES } from '../../utils/constants';
import { inject, observer } from 'mobx-react';
import TxProgressStatus from './TxProgressStatus';
import executeSequentially from '../../utils/executeSequentially';
import { Button, Panel } from 'react-bootstrap';

export default inject(
  'contractStore',
  'reservedTokenStore',
  'tierStore',
  'tokenStore',
  'web3Store',
  'deploymentStore'
)(
  observer(
    class Deployment extends Component {
      constructor(props) {
        super(props);
        this.state = {
          contractDownloaded: false,
          modal: false,
          transactionFailed: false
        };
        //this.props.deploymentStore.setDeploymentStep(3);
      }

      contractDownloadSuccess = options => {
        this.setState({ contractDownloaded: true });
      };

      deployCrowdsale = () => {
        const { contractStore, deploymentStore } = this.props;
        const isWhitelistWithCap =
          contractStore.contractType === CONTRACT_TYPES.whitelistwithcap;
        const firstRun = deploymentStore.deploymentStep === null;

        // if (isWhitelistWithCap) {
        if (firstRun) {
          setupContractDeployment().then(this.resumeContractDeployment);
        } else {
          this.resumeContractDeployment();
        }
        // }
      };

      resumeContractDeployment = () => {
        const { deploymentStore } = this.props;
        const startAt = deploymentStore.deploymentStep
          ? deploymentStore.deploymentStep
          : 0;
        const deploymentSteps = buildDeploymentSteps();
        executeSequentially(deploymentSteps, startAt, index => {
          deploymentStore.setDeploymentStep(index);
        })
          .then(() => {
            deploymentStore.setHasEnded(true);
          })
          .catch(this.handleError);
      };

      render() {
        const { deploymentStore } = this.props;
        return (
          <div>
            <Panel>
              <Panel.Body>
                <TxProgressStatus
                  txMap={deploymentStore.txMap}
                  deployCrowdsale={this.deployCrowdsale}
                  onSkip={
                    this.state.transactionFailed ? this.skipTransaction : null
                  }
                />
              </Panel.Body>
            </Panel>
          </div>
        );
      }
    }
  )
);
