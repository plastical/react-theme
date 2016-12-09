// External dependencies
import React, { Component } from 'react';
import { Link } from 'react-router';

class Pagination extends Component {
  render() {
    if (this.props.isFirstPage && this.props.isLastPage) {
      return null;
    }

    const next = parseInt(this.props.current) + 1;
    const prev = parseInt(this.props.current) - 1;

    return (
      <nav className="navigation posts_navigation clear" role="navigation">
        <div className="nav_links">
          {!this.props.isFirstPage ?
            <div className="nav_previous">
              <Link to={`${this.props.path}p/${prev}`}>Previous Page</Link>
            </div> :
            null
          }
          {!this.props.isLastPage ?
            <div className="nav_next">
              <Link to={`${this.props.path}p/${next}`}>Next Page</Link>
            </div> :
            null
          }
        </div>
      </nav>
    );
  }
}

export default Pagination;
