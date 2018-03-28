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
        val: props.value,
        error: this.validateValue(props.value)
      };
    }
    handleChange(e) {
      this.props.onValueUpdate({
        id: this.state.id,
        value: e.target.value,
        error: this.validateValue(e.target.value)
      });
    }
    validateValue(value) {
      var regex = new RegExp(this.props.regex);
      if (String(value).match(regex)) {
        return 'success';
      } else {
        return 'error';
      }
    }
    componentWillReceiveProps(newProps) {
      this.setState({
        id: newProps.id,
        val: newProps.value,
        error: this.validateValue(newProps.value)
      });
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
              value={state.val}
              disabled={props.disabled}
            />
            <FormControl.Feedback />
            <HelpBlock>{props.help}</HelpBlock>
          </FormGroup>
        </div>
      );
    }
  }
);
