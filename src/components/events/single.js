/* global PlasticalSettings */
// External dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { injectIntl } from 'react-intl';
import classNames from 'classnames';

// Internal dependencies
import { getTitle, getFeaturedMedia, getEditLink, getExcerpt } from 'utils/content-mixin';

// Components
import Media from '../post/image';

const Event = (props) => {
  const event = props;
  const intl = props.intl;

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

  const path = event.link.replace(PlasticalSettings.URL.base, PlasticalSettings.URL.path);

  const featuredMedia = getFeaturedMedia(event);
  const editLink = getEditLink(event, intl.formatMessage({ id: 'content-mixin.edit' }));

  return (
    <article id={`event-${event.id}`} className={classes}>
      {featuredMedia ?
        <Media media={featuredMedia} size={size} parentClass="entry_image" path={path} /> :
        null
      }
      <div className="entry_main">
        <h2 className="entry_title">
          <Link className="entry_link" to={path} rel="bookmark" dangerouslySetInnerHTML={getTitle(event)} />
        </h2>      
        <div className="entry_meta">
          <time className="entry_date published startdate" dateTime={event.events_startdate_iso}>
            {event.events_startdate}
          </time>
          {editLink ?
            <p dangerouslySetInnerHTML={editLink} /> :
            null
          }
        </div>
        <div className="entry_content" dangerouslySetInnerHTML={getExcerpt(event)} /> 
      </div>     
    </article>
  );
}

export default injectIntl(Event);
