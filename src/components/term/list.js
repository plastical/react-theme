/* global PlasticalSettings */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import isEqual from 'lodash/isequal';

// Internal dependencies
import QueryPosts from 'wordpress-query-posts';
import { isRequestingPostsForQuery, getPostsForQuery, getTotalPagesForQuery } from 'wordpress-query-posts/lib/selectors';

// Components
import PostList from 'components/posts/list';
import Pagination from 'components/pagination/archive';
import Placeholder from 'components/placeholder';

class Term extends Component {
  shouldComponentUpdate(nextProps) {
    const newQuery = !isEqual(nextProps.query, this.props.query);
    const newPosts = !isEqual(nextProps.posts, this.props.posts);
    return newQuery || newPosts;
  }

  render() {
    const { locale, query, posts, loading, path, page, totalPages, intl } = this.props;

    return (
      <div>

        <QueryPosts query={query || {}} />
        {loading ?
          <Placeholder /> :
          <PostList mediumList posts={posts} />
        }

        <Pagination
          path={path}
          length={posts.length}
          current={page}
          isFirstPage={page === 1}
          isLastPage={page === totalPages}
          totalPages={totalPages}
          intl={intl}
        />
        
      </div>
    );
  }
}

export default injectIntl(
  connect((state, ownProps) => {
    const locale = state.locale;
    const { query, taxonomy, term } = ownProps;
    let path = PlasticalSettings.URL.path || '/';

    if (locale.lang !== 'it') {
      query.lang = locale.lang;
    }

    path += (taxonomy === 'category') ? `category/${term}/` : `tag/${term}/`;

    // Needs to be below query setup
    const requesting = isRequestingPostsForQuery(state, query);
    const posts = getPostsForQuery(state, query) || [];

    return {
      locale,
      path,
      query,
      posts,
      requesting,
      loading: requesting && !posts,
      page: parseInt(query.page),
      totalPages: getTotalPagesForQuery(state, query),
    };
  })(Term)
);
