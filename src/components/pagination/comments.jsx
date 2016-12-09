// External dependencies
import React, { Component } from 'react';

const noop = () => {};

class Pagination extends Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }

  render() {
    const next = this.props.current + 1;
    const prev = this.props.current - 1;

    return (
      <nav className="navigation comment_navigation clear" role="navigation">
        <div className="nav_links">
          {(prev > 0) ?
            <div className="nav_previous">
              <a href="#" onClick={this.props.onPreviousPage}>Older Comments</a>
            </div> :
            null
          }
          {(next <= this.props.end) ?
            <div className="nav_next">
              <a href="#" onClick={this.props.onNextPage}>Newer Comments</a>
            </div> :
            null
          }
        </div>
      </nav>
    );
  }
}

Pagination.propTypes = {
  // start: React.PropTypes.number,
  current: React.PropTypes.number,
  end: React.PropTypes.number,
  onNextPage: React.PropTypes.func,
  onPreviousPage: React.PropTypes.func,
}

Pagination.defaultProps = {
  // start: 1,
  current: 1,
  onNextPage: noop,
  onPreviousPage: noop
}

export default Pagination;
