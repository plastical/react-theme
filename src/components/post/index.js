/* global PlasticalSettings */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import classNames from 'classnames';
import DocumentMeta from 'react-document-meta';
import ScrollIntoView from 'scroll-component';
import find from 'lodash/find';
import he from 'he';

// Internal dependencies
import BodyClass from 'utils/react-body-class';
import QueryPosts from 'wordpress-query-posts';
import { getPostIdFromSlug, isRequestingPost, getPost } from 'wordpress-query-posts/lib/selectors';
import { getTitle, getContent, getDate, getFeaturedMedia, getEditLink } from 'utils/content-mixin';

// Components
import PostMeta from './meta';
import Media from './image';
import Comments from 'components/comments';
import Placeholder from 'components/placeholder';
import Socials from 'components/socials';

class SinglePost extends Component {

  /* eslint no-underscore-dangle: 1 */
  getTaxonomy(post, taxonomy) {
    if (post === {}) {
      return [];
    }
    const terms = find(post._embedded['wp:term'], item => 
    ((item.constructor === Array) && (typeof item[0] !== 'undefined') && (taxonomy === item[0].taxonomy))
    );
    return terms;
  }    

  renderFeaturedImage() {
    const post = this.props.post;

    if (!post) {
      return null;
    }

    const featuredMedia = getFeaturedMedia(post);

    if (!featuredMedia) {
      return null;
    }

    return (
      <Media media={featuredMedia} parentClass="featured_image" />
    );
  }

  renderArticle() {
    const post = this.props.post;
    const intl = this.props.intl;

    if (!post) {
      return null;
    }

    const meta = {
      title: `${post.title.rendered} – ${PlasticalSettings.meta.title}`,
      description: post.excerpt.rendered,
      canonical: post.link
    };
    meta.title = he.decode(meta.title);

    const classes = classNames({
      entry: true
    });


    const featuredMedia = getFeaturedMedia(post);
    const editLink = getEditLink(post, intl.formatMessage({ id: 'content-mixin.edit' }));
    const title = getTitle(post);

    return (
      <article id={`post-${post.id}`} className={classes}>
        <ScrollIntoView id="#container" />          
        <DocumentMeta {...meta} />
        <BodyClass classes={['single', 'single_post']} />             
        <h1 className="entry_title" dangerouslySetInnerHTML={title} />
        <div className="entry_meta">   
          <time className="entry_date published updated" dateTime={post.date}>{getDate(post.date)}</time>        
          {editLink ?
            <p dangerouslySetInnerHTML={editLink} /> :
            null
          }
        </div>   
        {/* <PostMeta post={post} humanDate={getDate(post.date)} intl={intl} /> */}
        <div className="entry_content" dangerouslySetInnerHTML={getContent(post, intl.formatMessage({ id: 'content-mixin.passprotected' }))} />
        
        <div className="bumper" />  
        <Socials intl title={title.__html} summary={getContent(post, intl.formatMessage({ id: 'content-mixin.passprotected' }))} image={featuredMedia.source_url} />
        <div className="bumper" />  
      </article>
    );
  }

  renderCategories() {
    const post = this.props.post;

    if (!post) {
      return null;
    }

    let categories = this.getTaxonomy(this.props.post, 'category');

    if (typeof categories !== 'undefined') {
      categories = categories.map((item, i) => 
        <Link className="back_link" key={i} to={item.link}>{item.name}</Link>
      );
    } else {
      categories = null;
    }
    return (
      <div className="back">
        {categories}
        <span className="back_current" dangerouslySetInnerHTML={getTitle(post)} />
        <div className="lightest_sep" />
      </div>
    )
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
      <div className="contents">

        {!this.props.loading && this.renderCategories()}

        <div className="bumper" />
        {!this.props.loading && this.renderFeaturedImage()}

        <section id="main" className="col780 center clearfix single_entry" role="main" aria-live="assertive" tabIndex="-1">
          <QueryPosts postSlug={this.props.slug} />
          <div className="bumper" />   
          {this.props.loading ?
            <Placeholder type="post" /> :
            this.renderArticle()
          }

          {/* We won't accept comments, so... */}
          {/* !this.props.loading && this.renderComments() */}
        </section>
      </div>
    );
  }
}

export default injectIntl(
  connect((state, ownProps) => {
    const locale = state.locale;
    const slug = `${ownProps.match.params.slug}&lang=${locale.lang}` || false;
    const postId = getPostIdFromSlug(state, slug);
    const requesting = isRequestingPost(state, slug);
    const post = getPost(state, parseInt(postId));

    return {
      locale,
      slug,
      postId,
      post,
      requesting,
      loading: requesting && !post
    };
  })(SinglePost)
);
