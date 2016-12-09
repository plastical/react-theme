// External dependencies
import React, { Component } from 'react';

class SearchForm extends Component {
  getValue() {
    return this.input.value;
  }

  render() {
    return (
      <form role="search" className="search_form" onSubmit={this.props.onSubmit}>
        <label htmlFor="s">
          <span className="screen_reader_text">Search for:</span>
          <input ref={(c) => { this.input = c }} type="search" className="search_field" placeholder="Search …" name="s" title="Search for:" defaultValue={this.props.initialSearch} />
        </label>
        <input type="submit" className="search_submit" value="Search" />
      </form>
    );
  }
}

export default SearchForm;
