import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  HelpBlock
} from 'react-bootstrap';

export default observer(
  class RegexInput extends Component {
    constructor(props) {
      super(props);
      this.handleChange = this.handleChange.bind(this);
      this.validateValue = this.validateValue.bind(this);
      this.state = {
        id: props.id,
        value: props.value,
        error: this.validateValue(props.value)
      };
    }
    handleChange(e) {
      this.setState(
        { value: e.target.value, error: this.validateValue(e.target.value) },
        () => {
          this.props.onValueUpdate(this.state);
        }
      );
    }
    validateValue(value) {
      var regex = new RegExp(this.props.regex);
      if (value.match(regex)) {
        return 'success';
      } else {
        return 'error';
      }
    }

    render() {
      const state = this.state;
      const props = this.props;
      return (
        <div>
          <FormGroup controlId={state.id} validationState={state.error}>
            <ControlLabel>{props.title}</ControlLabel>
            <FormControl
              type={props.type}
              onChange={this.handleChange}
              value={props.value}
            />
            <FormControl.Feedback />
            <HelpBlock>{props.help}</HelpBlock>
          </FormGroup>
        </div>
      );
    }
  }
);
