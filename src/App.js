import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import { Provider } from 'mobx-react';
import SideNav, { Nav, NavIcon, NavText } from 'react-sidenav';

import CrowdsalePage from './components/CrowdsaleSetup';
import TokenPage from './components/TokenSetup';

// read ../../stores/index.js for configuration
import * as stores from './stores';

class App extends Component {
  render() {
    return (
      <Provider {...stores}>
        <Router>
          <div className="App">
            <Route path="/crowdsalePage" component={CrowdsalePage} />
            <Route path="/token" component={TokenPage} />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
