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
import CrowdsaleDetail from './components/CrowdsaleDetail';
import Invest from './components/Invest';
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
                            path="/crowdsale/step1"
                            component={ContractSetup}
                          />
                          <Route
                            path="/crowdsale/step2"
                            component={TokenSetup}
                          />
                          <Route
                            path="/crowdsale/step3"
                            component={CrowdsaleSetup}
                          />
                          <Route
                            path="/crowdsale/step4"
                            component={DeploymentSetup}
                          />
                          <Route path="/crowdsale/manage" component={Manage} />
                          <Route
                            path="/crowdsale/detail/:crowdsaleAddress"
                            component={CrowdsaleDetail}
                          />
                          <Route path="/crowdsale/invest" component={Invest} />
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
