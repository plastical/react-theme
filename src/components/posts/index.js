/* global PlasticalSettings */
// External dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import DocumentMeta from 'react-document-meta';
import ScrollIntoView from 'scroll-component';
import he from 'he';

// Internal dependencies
import BodyClass from 'utils/react-body-class';
import QueryPosts from 'wordpress-query-posts';
import { isRequestingPostsForQuery, getPostsForQuery, getTotalPagesForQuery } from 'wordpress-query-posts/lib/selectors';

// Components
import PostList from './list';
import Pagination from 'components/pagination/archive';
import Placeholder from 'components/placeholder';

const Posts = (props) => {
  const posts = props.posts;

  const meta = {
    title: PlasticalSettings.meta.title,
    description: PlasticalSettings.meta.description,
    canonical: PlasticalSettings.URL.base,
  };
  meta.title = he.decode(meta.title);

  return (
    <section id="main" className="col700 center clearfix" role="main" aria-live="assertive" tabIndex="-1">

      <ScrollIntoView id="#container" />  
      <DocumentMeta {...meta} />
      <BodyClass classes={['home', 'blog']} />
      <QueryPosts query={props.query} />
      {props.loading ?
        <Placeholder /> :        
        <PostList {...props} />
      }
      <Pagination
        path={props.path}
        length={posts.length}
        current={props.page}
        isFirstPage={props.page === 1}
        isLastPage={props.page === props.totalPages}
        totalPages={props.totalPages}
        intl={props.intl}
      />

    </section>
  );
};

export default injectIntl(
  connect((state, ownProps) => {
    const locale = state.locale;
    const query = {};
    if (locale.lang !== 'en') {
      query.lang = locale.lang;
    }
    query.page = ownProps.params.paged || 1;

    let path = PlasticalSettings.URL.path || '/';
    if (PlasticalSettings.frontPage.page) {
      path += `page/${PlasticalSettings.frontPage.blog}/`;
    }
    if (locale.lang !== 'en') {
      path += `/${locale.lang}/${path}`;
    }

    const posts = getPostsForQuery(state, query) || [];
    const requesting = isRequestingPostsForQuery(state, query);

    return {
      locale,
      path,
      page: parseInt(query.page),
      query,
      posts,
      requesting,
      loading: requesting && !posts,
      totalPages: getTotalPagesForQuery(state, query),
    };
  })(Posts)
);
