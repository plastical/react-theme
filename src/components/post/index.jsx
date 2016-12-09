/* global PlasticalSettings */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import DocumentMeta from 'react-document-meta';

// Internal dependencies
import BodyClass from 'utils/react-body-class';
import QueryPosts from 'wordpress-query-posts';
import { getPostIdFromSlug, isRequestingPost, getPost } from 'wordpress-query-posts/lib/selectors';
import { getTitle, getContent, getDate, getFeaturedMedia } from 'utils/content-mixin';

// Components
import PostMeta from './meta';
import Media from './image';
import Comments from 'components/comments';
import Placeholder from 'components/placeholder';

class SinglePost extends Component {

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
        <BodyClass classes={['single', 'single_post']} />
        <h1 className="entry_title" dangerouslySetInnerHTML={getTitle(post)} />
        {featuredMedia ?
          <Media media={featuredMedia} parentClass="entry_image" /> :
          null
        }
        <div className="entry_meta" />
        <div className="entry_content" dangerouslySetInnerHTML={getContent(post)} />

        <PostMeta post={post} humanDate={getDate(post)} />
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
        isProtected={post.content.protected}
        postId={this.props.postId}
        title={<span dangerouslySetInnerHTML={getTitle(post)} />}
        commentsOpen={post.comment_status === 'open'}
      />
    )
  }

  render() {
    return (
      <div className="card">
        <QueryPosts postSlug={this.props.slug} />
        {this.props.loading ?
          <Placeholder type="post" /> :
          this.renderArticle()
        }

        {!this.props.loading && this.renderComments()}
      </div>
    );
  }
}

export default connect((state, ownProps) => {
  const slug = ownProps.params.slug || false;
  const postId = getPostIdFromSlug(state, slug);
  const requesting = isRequestingPost(state, slug);
  const post = getPost(state, parseInt(postId));

  return {
    slug,
    postId,
    post,
    requesting,
    loading: requesting && !post
  };
})(SinglePost);
