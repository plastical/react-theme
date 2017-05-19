/* global PlasticalSettings */
import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';

// Internal dependencies
import QueryPage from 'wordpress-query-page';
import { getPageIdFromPath, isRequestingPage, getPage } from 'wordpress-query-page/lib/selectors';
import { getTitle, getContent, getEditLink } from 'utils/content-mixin';

// Components
import Placeholder from 'components/placeholder';

const Content = (props) => {
  const { post, intl, hideTitle } = props;

  if (!post) {
    return null;
  } 

  const editLink = getEditLink(post, intl.formatMessage({ id: 'content-mixin.edit' }));

  return (
    <div> 
      {!hideTitle ?
        <h1 dangerouslySetInnerHTML={getTitle(post)} /> :
        null
      } 
      {editLink ?           
        <div className="entry_meta" dangerouslySetInnerHTML={editLink} /> :
        null
      }        
      <div dangerouslySetInnerHTML={getContent(post, intl.formatMessage({ id: 'content-mixin.passprotected' }))} />
    </div>
  )
}

const HomeWidget = (props) => 
  <div>
    <QueryPage pagePath={props.path} />
    {props.loading ?
      <Placeholder type="page" /> :
      <Content {...props} />
    }
  </div>

export default injectIntl(
  connect((state, ownProps) => {   
    const locale = state.locale;
    let path = ownProps.slug;

    if (locale.lang !== 'it') {
      path = `/${locale.lang}/page/${path}&lang=${locale.lang}`;
    } else {
      path = `/page/${path}&lang=${locale.lang}`;
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
    }
  })(HomeWidget)
);
