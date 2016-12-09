/* global PlasticalSettings */
// External dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import DocumentMeta from 'react-document-meta';

// Internal dependencies
import BodyClass from 'utils/react-body-class';
import QueryPosts from 'wordpress-query-posts';
import { isRequestingPostsForQuery, getPostsForQuery, getTotalPagesForQuery } from 'wordpress-query-posts/lib/selectors';

// Components
import PostList from './list';
import Pagination from 'components/pagination/archive';
import Placeholder from 'components/placeholder';

const Index = (props) => {
  const posts = this.props.posts;
  const meta = {
    title: PlasticalSettings.meta.title,
    description: PlasticalSettings.meta.description,
    canonical: PlasticalSettings.URL.base,
  };

  return (
    <div className="site_content">
      <DocumentMeta {...meta} />
      <BodyClass classes={['home', 'blog']} />
      <QueryPosts query={this.props.query} />
      {this.props.loading ?
        <Placeholder type="posts" /> :
        <PostList posts={posts} />
      }
      <Pagination
        path={this.props.path}
        current={this.props.page}
        isFirstPage={this.props.page === 1}
        isLastPage={this.props.page === this.props.totalPages}
      />
    </div>
  );
};

export default connect((state, ownProps) => {
  const query = {};
  query.page = ownProps.params.paged || 1;

  let path = PlasticalSettings.URL.path || '/';
  if (PlasticalSettings.frontPage.page) {
    path += `page/${PlasticalSettings.frontPage.blog}/`;
  }

  const posts = getPostsForQuery(state, query) || [];
  const requesting = isRequestingPostsForQuery(state, query);

  return {
    path,
    page: parseInt(query.page),
    query,
    posts,
    requesting,
    loading: requesting && !posts,
    totalPages: getTotalPagesForQuery(state, query),
  };
})(Index);
