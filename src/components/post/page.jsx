/* global PlasticalSettings */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import DocumentMeta from 'react-document-meta';

// Internal dependencies
import BodyClass from 'utils/react-body-class';
import QueryPage from 'wordpress-query-page';
import { getPageIdFromPath, isRequestingPage, getPage } from 'wordpress-query-page/lib/selectors';
import { getTitle, getContent, getFeaturedMedia } from 'utils/content-mixin';

// Components
import Media from './image';
import Comments from 'components/comments';
import Placeholder from 'components/placeholder';

class SinglePage extends Component {

  renderArticle() {
    const post = this.props.post;
    if (!post) {
      return null;
    }

    const meta = {
      title: `${post.title.rendered} – ${PlasticalSettings.meta.title}`,
      description: post.excerpt.rendered,
      canonical: post.link,
    };

    const classes = classNames({
      entry: true
    });
    const featuredMedia = getFeaturedMedia(post);

    return (
      <article id={`post-${post.id}`} className={classes}>
        <DocumentMeta {...meta} />
        <BodyClass classes={['page', 'single', 'single_page']} />
        <h1 className="entry_title" dangerouslySetInnerHTML={getTitle(post)} />
        {featuredMedia ?
          <Media media={featuredMedia} parentClass="entry_image" /> :
          null
        }
        <div className="entry_meta" />
        <div className="entry_content" dangerouslySetInnerHTML={getContent(post)} />
      </article>
    );
  }

  renderComments() {
    const post = this.props.post;
    if (!post) {
      return null;
    }

    return (
      <Comments
        postId={this.props.postId}
        title={<span dangerouslySetInnerHTML={getTitle(post)} />}
        commentsOpen={post.comment_status === 'open'}
      />
    )
  }

  render() {
    return (
      <div className="card">
        <QueryPage pagePath={this.props.path} />

        {this.props.loading ?
          <Placeholder type="page" /> :
          this.renderArticle()
        }

        {!this.props.loading && this.renderComments()}
      </div>
    );
  }
}

export default connect((state, ownProps) => {
  let path = ownProps.params.splat || ownProps.route.slug;
  if (path[path.length - 1] === '/') {
    path = path.slice(0, -1);
  }

  const postId = getPageIdFromPath(state, path);
  const requesting = isRequestingPage(state, path);
  const post = getPage(state, parseInt(postId));

  return {
    path,
    postId,
    post,
    requesting,
    loading: requesting && !post
  };
})(SinglePage);
