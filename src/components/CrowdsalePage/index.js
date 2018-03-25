import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Panel } from 'react-bootstrap';

export default class CrowdSalePage extends Component {
  constructor(props) {
    super(props);
    console.log(this.props);
  }
  render() {
    return (
      <Panel>
        <Panel.Body>Basic panel example</Panel.Body>
      </Panel>
    );
  }
}

inject('contractStore', 'web3Store')(observer(CrowdSalePage));
