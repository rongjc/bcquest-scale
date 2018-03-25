import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

export default class TokenPage extends Component {
  render() {
    return <div>Token Page</div>;
  }
}

inject('store1', 'store2')(observer(TokenPage));
