// Header.js
import React, { Component } from 'react';

export default class Header extends Component {
  render() {
    return (
      <header className="main-header">
        <a href="#" className="logo">
          <span className="logo-mini">
            <b>A</b>LT
          </span>
          <span className="logo-lg">
            <b>BCQuest</b>
          </span>
        </a>
        <nav className="navbar navbar-static-top" />
      </header>
    );
  }
}
