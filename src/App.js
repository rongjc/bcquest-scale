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
              <section className="content-header">
                <div className="row">
                  <div className="col-md-12">
                    <div className="box">
                      <div className="box-header with-border">
                        <h3 className="box-title">Monthly Recap Report</h3>
                      </div>
                      <div className="box-body">
                        <div className="row">
                          <div className="col-md-8">
                            <p className="text-center">
                              <Route
                                path="/contract"
                                component={ContractSetup}
                              />
                              <Route path="/token" component={TokenSetup} />
                              <Route
                                path="/crowdsale"
                                component={CrowdsaleSetup}
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="box-footer">
                        <div className="row">
                          <div className="col-sm-3 col-xs-6">
                            <div className="description-block border-right">
                              <span className="description-percentage text-green">
                                <i className="fa fa-caret-up" /> 17%
                              </span>
                              <h5 className="description-header">$35,210.43</h5>
                              <span className="description-text">
                                TOTAL REVENUE
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
