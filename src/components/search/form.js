/* eslint no-param-reassign: 1 */
// External dependencies
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router';
import { injectIntl } from 'react-intl';

// Internal dependencies
import validate from 'utils/validate';

class SearchForm extends Component {
  static contextTypes = {
    closeToggles: PropTypes.func.isRequired // This triggers the closing of the toggles (nav and search)
  };

  constructor(props) {
    super(props);
    this.state = {
      error_search: false,
      errors: false
    }
    this.onBlur = this.onBlur.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onBlur(e) {
    // this.validation(e);  
  }

  onSubmit(e) {
    e.preventDefault();
    e.persist();
    this.validation(e);  
    const term = e.target.s.value.trim();

    if (this.state.errors === false && term.length > 2) {    
      const url = `${PlasticalSettings.URL.path}search/${term}/`;
      window.h.push(url);
      e.target.s.value = '';
      this.setState({ 
        error_search: false,
        errors: false 
      });
      this.context.closeToggles(false);
    } 
    return null;    
  }

  validation(e) {
    if (e.target.name === 's') {
      this.setState({ error_search: validate.validateMinLength(e.target.value, 3) || validate.validateNoWeirdChrs(e.target.value) });
    }
    if (this.state.error_search) {
      this.setState({ errors: true });
    } else {
      this.setState({ errors: false });
    }
  }

  /* eslint no-undef: 1 */
  render() {
    const intl = this.props.intl;    
    
    return (
      <form role="search" className="search_form" onSubmit={this.onSubmit}>
        <label htmlFor="s" />
        <input name="s" type="search" className="search_field" onBlur={this.onBlur} placeholder={intl.formatMessage({ id: 'search.search' })} />
        {(this.state.error_search) ? <span className="error_message">{intl.formatMessage({ id: 'search.search_err' })}</span> : null}
        <input type="submit" className="search_submit" value={intl.formatMessage({ id: 'search.search_btn' })} />
      </form>
    );
  }
}

export default injectIntl(SearchForm);
