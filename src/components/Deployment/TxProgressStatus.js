import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { TX_STEP_DESCRIPTION } from '../../utils/constants';
import { Glyphicon, Table, Button } from 'react-bootstrap';

export default inject('tierStore', 'deploymentStore')(
  observer(
    class TxProgressStatus extends Component {
      constructor(props) {
        super(props);

        this.state = {
          showModal: true
        };
      }

      txStatuses = () => {
        const { txMap } = this.props;
        const table = [];

        txMap.forEach((status, name) => {
          table.push({ name, status });
        });

        return table;
      };

      render() {
        const { tierStore, deploymentStore } = this.props;
        const tiers = new Array(tierStore.tiers.length).fill(true);
        const tableContent = this.txStatuses();

        return tableContent.length ? (
          <div>
            <Table striped bordered condensed hover>
              <thead>
                <tr>
                  <th key="name">Tx Name</th>
                  {tiers.map((value, index) => (
                    <th key={index.toString()}>Tier {index + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableContent.map(
                  (tx, index) =>
                    tx.status.length ? (
                      <tr key={'row' + index.toString()}>
                        <td key={'rowname' + index.toString()}>
                          {TX_STEP_DESCRIPTION[tx.name]}
                        </td>
                        {tiers.map((value, index) => (
                          <td key={'rowstats' + index.toString()}>
                            {tx.status[index] === true ? (
                              <Glyphicon glyph="ok" />
                            ) : tx.status[index] === false ? (
                              <Glyphicon glyph="remove" />
                            ) : (
                              ''
                            )}
                          </td>
                        ))}
                      </tr>
                    ) : null
                )}
              </tbody>
            </Table>
            <div>
              {process.env.NODE_ENV === 'development' &&
              !deploymentStore.deploymentHasFinished ? (
                !deploymentStore.deploymentStep ? (
                  <Button
                    bsStyle="primary"
                    onClick={this.props.deployCrowdsale}
                  >
                    Deploy
                  </Button>
                ) : (
                  <Button
                    bsStyle="primary"
                    onClick={this.props.deployCrowdsale}
                  >
                    Resume
                  </Button>
                )
              ) : null}
            </div>
          </div>
        ) : null;
      }
    }
  )
);
