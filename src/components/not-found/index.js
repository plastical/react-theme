/* global PlasticalSettings */
import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import classNames from 'classnames';
import DocumentMeta from 'react-document-meta';
import BodyClass from 'utils/react-body-class';
import ScrollIntoView from 'scroll-component';
import he from 'he';

const NotFound = (props) => {
  const intl = props.intl;

  const classes = classNames({
    entry: true
  });

  const meta = {
    title: `404 ${intl.formatMessage({ id: 'not-found.not-found' })} – ${PlasticalSettings.meta.title}`,
  };
  meta.title = he.decode(meta.title);

  return (
    <section id="main" className="col620 center clearfix" role="main" aria-live="assertive" tabIndex="-1">
      <article className={classes}>
        <ScrollIntoView id="#container" />
        <DocumentMeta {...meta} />
        <BodyClass classes={['not-found']} />
        <h2 className="entry_title">{intl.formatMessage({ id: 'not-found.not-found' })}</h2>

        <div className="entry_content">
          <p>{intl.formatMessage({ id: 'not-found.description' })}</p>
        </div>

        <div className="entry_meta" />
      </article>
    </section>
  );
}

export default injectIntl(
  connect((state, ownProps) => {
    const locale = state.locale;
    return {
      locale
    };
  })(NotFound)
);
