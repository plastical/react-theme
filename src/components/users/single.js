/* global PlasticalSettings */
// External dependencies
import React, { Component } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';

// Internal dependencies
import { getCapitalize } from 'utils/content-mixin';

function getTitle(data) {
  return { __html: data };
}

const User = (props) => {
  const user = props;
  const status = props.status;

  const classes = classNames({
    entry: true
  });

  const path = user.link.replace(PlasticalSettings.URL.base, PlasticalSettings.URL.path);

  return (
    <article id={`user-${user.id}`} className={classes}>      
      {user.meta.avatar ?
        <div className="entry_image">
          <Link className="entry_link" to={path} rel="bookmark">
            <img src={user.meta.avatar} alt={user.name} />
          </Link>
        </div> :
        null
      }
      <div className="entry_main">
        <h2 className="entry_title">
          <Link className="entry_link" to={path} rel="bookmark"><span dangerouslySetInnerHTML={getTitle(user.name)} /></Link>
        </h2>
        <div className="entry_content">
          {(props.locale.lang === 'it' && user.meta.industry === 'Other') ? 'Altro' : user.meta.industry} 
          {(status && user.meta.current_status === 'alumni') ? <span> - {user.meta.city} - </span> : null}
          {(status && user.meta.current_status === 'alumni') ? 
            <strong>{getCapitalize(user.meta.current_status.toLowerCase())}</strong> :
            null
          }  
        </div>         
      </div>
    </article>
  );
}

export default User;
