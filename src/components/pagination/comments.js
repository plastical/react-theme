// External dependencies
import React from 'react';

const noop = () => {};

const Pagination = (props) => {

  const intl = props.intl;
  const next = props.current + 1;
  const prev = props.current - 1;

  return (
    <nav className="navigation comment_navigation clear" role="navigation">
      <div className="nav_links">
        {(prev > 0) ?
          <div className="nav_previous">
            <a href="#" onClick={props.onPreviousPage}>{intl.formatMessage({ id: 'pagination.older' })}</a>
          </div> :
          null
        }
        {(next <= props.end) ?
          <div className="nav_next">
            <a href="#" onClick={props.onNextPage}>{intl.formatMessage({ id: 'pagination.newer' })}</a>
          </div> :
          null
        }
      </div>
    </nav>
  );
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
