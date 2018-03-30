import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import { Provider } from 'mobx-react';

import Header from './components/Header';
import SideNav, { Nav, NavIcon, NavText } from 'react-sidenav';
import SideBar from './components/SideBar';

import ContractSetup from './components/ContractSetup';
import TokenSetup from './components/TokenSetup';
import CrowdsaleSetup from './components/CrowdsaleSetup';

// read ../../stores/index.js for configuration
import * as stores from './stores';

class App extends Component {
  render() {
    return (
      <Provider {...stores}>
        <Router>
          <div className="App">
            <Header />
            <SideBar />
            <div className="content-wrapper">
              <Route path="/contract" component={ContractSetup} />
              <Route path="/token" component={TokenSetup} />
              <Route path="/crowdsale" component={CrowdsaleSetup} />
            </div>
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
