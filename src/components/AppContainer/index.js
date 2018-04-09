import React, { Component } from 'react';

export default class AppContainer extends Component {
  render() {
    return (
      <div className="content-wrapper">
        <section className="content-header">
          <div className="row">
            <div className="box-body">
              <div className="row">
                <div className="col-md-8 text-left" />
                {this.props.children}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}
