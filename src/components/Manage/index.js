import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Panel, Table, Button } from 'react-bootstrap';
import { loadRegistryAddresses } from '../../utils/blockchainHelpers';
import { inject, observer } from 'mobx-react';

export default inject('crowdsaleStore')(
  observer(
    class Manage extends Component {
      constructor(props) {
        super(props);
        this.state = {
          showModal: false,
          loading: true
        };
      }

      chooseContract = () => {
        this.setState({
          loading: true
        });

        loadRegistryAddresses().then(
          () => {
            this.setState({
              loading: false,
              showModal: true
            });
            console.log(this.props.crowdsaleStore);
          },
          e => {
            console.error(
              'There was a problem loading the crowdsale addresses from the registry',
              e
            );
            this.setState({
              loading: false
            });
          }
        );
      };

      componentDidMount() {
        this.chooseContract();
      }

      onClick = crowdsaleAddress => {
        this.props.history.push('/crowdsale/manage/' + crowdsaleAddress);
      };

      hideModal = () => {
        this.setState({ showModal: false });
      };

      render() {
        const props = this.props;
        console.log(props);
        return (
          <div>
            <Table striped bordered condensed hover>
              <thead>
                <tr>
                  <th>ADDRESS</th>
                  <th>Manage</th>
                </tr>
              </thead>
              <tbody>
                {props.crowdsaleStore.crowdsales.map((row, i) => {
                  return (
                    <tr key={i}>
                      <td>{row}</td>
                      <td>
                        <Button
                          bsStyle="primary"
                          href={'/crowdsale/detail/' + row}
                        >
                          Manage
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        );
      }
    }
  )
);
