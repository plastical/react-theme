/* global PlasticalSettings */
// External dependencies
import React, { Component } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';

// Internal dependencies
import { getTitle, getContent, getDate, getExcerpt, getFeaturedMedia } from 'utils/content-mixin';

class Post extends Component {
  render() {
    const post = this.props;

    if (post.type === 'attachment') {
      return null;
    }

    const classes = classNames({
      entry: true
    });

    const path = post.link.replace(PlasticalSettings.URL.base, PlasticalSettings.URL.path);

    return (
      <article id={`post-${post.id}`} className={classes}>
        <h2 className="entry_title">
          <Link to={path} rel="bookmark" dangerouslySetInnerHTML={getTitle(post)} />
        </h2>

        <div className="entry_content" dangerouslySetInnerHTML={getExcerpt(post)} />

        <div className="entry_meta">
          <div className="entry_meta_label">published</div>
          <div className="entry_meta_value">
            <a href={post.link} rel="bookmark">
              <time className="entry_date published updated" dateTime={post.date}>{getDate(post)}</time>
            </a>
          </div>
        </div>
      </article>
    );
  }
}

export default Post;
