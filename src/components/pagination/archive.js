// External dependencies
import React from 'react';
import { Link } from 'react-router';

const NumericPager = (props) => {
  const intl = props.intl;  

  const paged = parseInt(props.current);
  
  const totalPages = props.totalPages;
  const pagesToShow = 7;
  const pagesToShowMinus1 = pagesToShow - 1;
  const halfPageStart = Math.floor(pagesToShowMinus1 / 2);
  const halfPageEnd = Math.ceil(pagesToShowMinus1 / 2);

  let startPage = paged - halfPageStart;
  if (startPage <= 0) {
    startPage = 1;
  }
  let endPage = paged + halfPageEnd;
  if ((endPage - startPage) !== pagesToShowMinus1) {
    endPage = startPage + pagesToShowMinus1;
  }
  if (endPage > totalPages) {
    startPage = totalPages - pagesToShowMinus1;
    endPage = totalPages;
  }
  if (startPage <= 0) {
    startPage = 1;
  }
  const next = parseInt(paged) + 1;
  const prev = parseInt(paged) - 1;

  const pagination = [];

  for (let i = startPage; i <= endPage; i += 1) {
    if (i === paged) {
      pagination.push(<li key={i} className="current_link">{i}</li>);
    } else {
      pagination.push(<li key={i}><Link to={`${props.path}p/${i}/`}>{i}</Link></li>);
    }
  }

  return (
    <ol className="page_nav">
      {(startPage >= 2 && pagesToShow < totalPages) ?
        <li><Link className="first_page_link" to={props.path}>{props.intl.formatMessage({ id: 'pagination.first' })}</Link></li> :
        null
      }
      {!props.isFirstPage ?
        <li>
          <Link className="prev_link" to={`${props.path}p/${prev}/`}>«</Link>
        </li> :
        null
      }
      {pagination}
      {!props.isLastPage ?
        <li>
          <Link className="next_link" to={`${props.path}p/${next}/`}>»</Link>
        </li> :
        null
      }
      {endPage < totalPages ?
        <li><Link className="last_page_link" to={`${props.path}p/${totalPages}/`}>{props.intl.formatMessage({ id: 'pagination.last' })}</Link></li> :
        null
      }
    </ol>
  )
}

const Pagination = (props) => {
  if (props.isFirstPage && props.isLastPage) {
    return null;
  }

  if (props.totalPages <= props.current && props.current < 1) {
    return null;
  }

  return (
    <nav className="pagination" role="navigation">
      <NumericPager {...props} />
    </nav>
  );
}

export default Pagination;
