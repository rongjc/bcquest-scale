import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

export default class CrowdSalePage extends Component {
  constructor(props) {
    super(props);
    console.log(this.props);
  }
  render() {
    return <div>CrowdSalePage</div>;
  }
}

inject('contractStore', 'web3Store')(observer(CrowdSalePage));
