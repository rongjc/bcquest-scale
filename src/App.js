import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import { Provider } from 'mobx-react';
import createBrowserHistory from 'history/createBrowserHistory';
import Header from './components/Header';
import SideNav, { Nav, NavIcon, NavText } from 'react-sidenav';
import SideBar from './components/SideBar';

import ContractSetup from './components/ContractSetup';
import TokenSetup from './components/TokenSetup';
import CrowdsaleSetup from './components/CrowdsaleSetup';
import DeploymentSetup from './components/Deployment';
import Manage from './components/Manage';

// read ../../stores/index.js for configuration
import * as stores from './stores';

const browserHistory = createBrowserHistory();
class App extends Component {
  render() {
    return (
      <Provider {...stores} history={browserHistory}>
        <Router>
          <div className="App">
            <Header />
            <SideBar />
            <div className="content-wrapper">
              <section className="content-header">
                <div className="row">
                  <div className="box-body">
                    <div className="row">
                      <div className="col-md-8 text-left">
                        <Switch>
                          <Route
                            path="/crowdsalestep1"
                            component={ContractSetup}
                          />
                          <Route
                            path="/crowdsalestep2"
                            component={TokenSetup}
                          />
                          <Route
                            path="/crowdsalestep3"
                            component={CrowdsaleSetup}
                          />
                          <Route
                            path="/crowdsalestep4"
                            component={DeploymentSetup}
                          />
                          <Route path="/manage" component={Manage} />
                          <Route
                            path="/crowdsaledetail/:crowdsaleAddress"
                            component={Manage}
                          />
                        </Switch>
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
