/* global PlasticalSettings */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import classNames from 'classnames';
import DocumentMeta from 'react-document-meta';
import ScrollIntoView from 'scroll-component';
import he from 'he';

// Internal dependencies
import BodyClass from 'utils/react-body-class';
import QueryPage from 'wordpress-query-page';
import { getPageIdFromPath, isRequestingPage, getPage } from 'wordpress-query-page/lib/selectors';
import { getTitle, getContent, getFeaturedMedia, getEditLink } from 'utils/content-mixin';

// Components
import ContactForm from './form';
import Media from '../post/image';
import Placeholder from 'components/placeholder';

class Contact extends Component {
  renderPage() {
    const { post, intl, location } = this.props;
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
  
    return (
      <article className={classes}>
        <ScrollIntoView id="#container" />
        <DocumentMeta {...meta} />
        <BodyClass classes={['contact']} />
        <h1 className="entry_title" dangerouslySetInnerHTML={getTitle(post)} />
        {editLink ?           
          <div className="entry_meta" dangerouslySetInnerHTML={editLink} /> :
          null
        }
        {featuredMedia ?
          <Media media={featuredMedia} parentClass="entry_image" /> :
          null
        }
        <div className="entry_content" dangerouslySetInnerHTML={getContent(post, intl.formatMessage({ id: 'content-mixin.passprotected' }))} />

        <div className="light_sep" />
        <div className="bumper" />
        <ContactForm locale={this.props.locale} intl={intl} />
      </article> 
    )
  }

  render() {
    return (
      <section id="main" className="col620 center clearfix" role="main" aria-live="assertive" tabIndex="-1">

        <QueryPage pagePath={this.props.path} />

        {this.props.loading ?
          <Placeholder type="page" /> :
          this.renderPage()
        }

      </section>
    )
  }
}

export default injectIntl(
  connect((state, ownProps) => {
    const locale = state.locale;
    let path = ownProps.location.pathname;

    if (path[path.length - 1] === '/') {
      path = path.slice(0, -1);
    }

    if (locale.lang !== 'it') {
      path = path.replace(`/${locale.lang}/`, '/');
      path = `${locale.lang}/page${path}&lang=${locale.lang}`;
    }

    const postId = getPageIdFromPath(state, path);
    const requesting = isRequestingPage(state, path);
    const post = getPage(state, parseInt(postId));

    return {
      locale,
      path,
      postId,
      post,
      requesting,
      loading: requesting && !post
    };
  })(Contact)
);
