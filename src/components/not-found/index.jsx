/* global PlasticalSettings */
import React from 'react';
import classNames from 'classnames';
import DocumentMeta from 'react-document-meta';
import BodyClass from 'utils/react-body-class';

const NotFound = () => {
  const classes = classNames({
    entry: true
  });

  const meta = {
    title: `Page not found – ${PlasticalSettings.meta.title}`,
  };

  return (
    <article className={classes}>
      <DocumentMeta {...meta} />
      <BodyClass classes={['not-found']} />
      <h2 className="entry_title">Not Found</h2>

      <div className="entry_content">
        <p>Something about no posts found.</p>
      </div>

      <div className="entry_meta" />
    </article>
  );
}

export default NotFound;
