/* global PlasticalSettings */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import DocumentMeta from 'react-document-meta';
import moment from 'moment';

// Internal dependencies
import BodyClass from 'utils/react-body-class';
import QueryPosts from 'wordpress-query-posts';
import { isRequestingPostsForQuery, getPostsForQuery, getTotalPagesForQuery } from 'wordpress-query-posts/lib/selectors';

// Components
import PostList from 'components/posts/list';
import Pagination from 'components/pagination/archive';
import Placeholder from 'components/placeholder';

const DateArchive = () => {
  const { query, loading, path, page, totalPages, dateString, posts } = this.props;
  const meta = {
    title: `${dateString} – ${PlasticalSettings.meta.title}`,
  };

  return (
    <div className="card">
      <DocumentMeta {...meta} />
      <BodyClass classes={['archive', 'date']} />
      <header className="page_header">
        <h1 className="page_title">Archive for {dateString}</h1>
      </header>
      <QueryPosts query={query} />
      {loading ?
        <Placeholder type="date" /> :
        <PostList posts={posts} />
      }

      <Pagination
        path={path}
        current={page}
        isFirstPage={page === 1}
        isLastPage={page === totalPages}
      />
    </div>
  );
}

/* eslint no-prototype-builtins: 1 */
export default connect((state, ownProps) => {
  let path = PlasticalSettings.URL.path || '/';
  path += 'date/';
  ['year', 'month', 'day'].map((key) => {
    if (ownProps.params.hasOwnProperty(key)) {
      path += `${ownProps.params[key]}/`;
    }
  });

  const { day, month, year } = ownProps.params;
  let date = {};
  let dateString = {};
  const query = {};
  query.paged = ownProps.params.paged || 1;
  if (day) {
    date = moment(`${year} ${month} ${day}`, 'YYYY MM DD');
    dateString = date.format('MMMM Do YYYY');
    query.after = date.format();
    query.before = date.add(1, 'day').format();
  } else if (month) {
    date = moment(`${year} ${month}`, 'YYYY MM');
    dateString = date.format('MMMM YYYY');
    query.after = date.format();
    query.before = date.add(1, 'month').format();
  } else {
    date = moment(`${year}`, 'YYYY');
    dateString = date.format('YYYY');
    query.after = date.format();
    query.before = date.add(1, 'year').format();
  }

  const posts = getPostsForQuery(state, query) || [];
  const requesting = isRequestingPostsForQuery(state, query);

  return {
    path,
    query,
    posts,
    requesting,
    dateString,
    loading: requesting && !posts,
    page: parseInt(query.paged),
    totalPages: getTotalPagesForQuery(state, query),
  };
})(DateArchive);
