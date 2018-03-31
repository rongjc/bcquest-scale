// SideBar.js

import React, { Component } from 'react';

export default class SideBar extends Component {
  render() {
    return (
      <aside className="main-sidebar">
        <section className="sidebar">
          <ul className="sidebar-menu" data-widget="tree">
            <li className="header">Crowdsale</li>
            <li>
              <a href="pages/widgets.html">
                <i className="fa fa-th" /> <span>New</span>
              </a>
              <a href="pages/widgets.html">
                <i className="fa fa-th" /> <span>Completed</span>
              </a>
            </li>
          </ul>
        </section>
      </aside>
    );
  }
}
