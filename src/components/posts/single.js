/* global PlasticalSettings */
// External dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import classNames from 'classnames';

// Internal dependencies
import { getTitle, getEditLink, getContent, getDate, getExcerpt, getFeaturedMedia } from 'utils/content-mixin';

// Components
import Media from '../post/image';

const Post = (props) => {
  const post = props;
  const intl = props.intl;

  if (post.type === 'attachment') {
    return null;
  }

  const classes = classNames({
    entry: true
  });

  let size = 'large'; // parent's props let us define the thumb size
  if (props.smallList) {
    size = 'thumb';
  }
  if (props.mediumList) {
    size = 'medium';
  }

  const path = post.link.replace(PlasticalSettings.URL.base, PlasticalSettings.URL.path);

  const featuredMedia = getFeaturedMedia(post);
  const editLink = getEditLink(post, intl.formatMessage({ id: 'content-mixin.edit' }));

  return (
    <article id={`post-${post.id}`} className={classes}>
      {featuredMedia ?
        <Media media={featuredMedia} size={size} parentClass="entry_image" path={path} /> :
        null
      }
      <div className="entry_main">
        <h2 className="entry_title">
          <Link className="entry_link" to={path} rel="bookmark" dangerouslySetInnerHTML={getTitle(post)} />
        </h2>        
        <div className="entry_meta">   
          <time className="entry_date published updated" dateTime={post.date}>{getDate(post.date)}</time>        
          {editLink ?
            <p dangerouslySetInnerHTML={editLink} /> :
            null
          }
        </div>
        <div className="entry_content" dangerouslySetInnerHTML={getExcerpt(post)} /> 
      </div>  
    </article>       
  );
}

export default injectIntl(Post);
