import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import autosave from './stores/autosave';
import CrowdsalePage from './components/CrowdsalePage';
import TokenPage from './components/TokenPage';

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Welcome to React</h1>
          </header>
          <p className="App-intro">
            To get started, edit <code>src/App.js</code> and save to reload.
          </p>
          <Route path="/crowdsalePage" component={CrowdsalePage} />
          <Route path="/token" component={TokenPage} />
        </div>
      </Router>
    );
  }
}

export default App;