/* global PlasticalSettings, PlasticalData, PlasticalMenu, jQuery */
// Load in the babel (es6) polyfill, and fetch polyfill
import 'babel-polyfill';
import 'whatwg-fetch';

// React
import React, { Component } from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory, applyRouterMiddleware } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { useScroll } from 'react-router-scroll';
import { bindActionCreators } from 'redux';

// Load the CSS
require('../sass/style.scss');

// Internal
import Navigation from 'components/navigation';
import Index from 'components/posts';
import SinglePost from 'components/post';
import SinglePage from 'components/post/page';
import Term from 'components/term';
import Search from 'components/search';
import DateArchive from 'components/date';
import NotFound from 'components/not-found';
import { createReduxStore } from './state';
import { setMenu } from 'wordpress-query-menu/lib/state';
import { setPost, setPosts } from './utils/initial-actions';

// Accessibility!
import { keyboardFocusReset, skipLink } from 'utils/a11y';

// Now the work starts.
const store = createReduxStore();
const history = syncHistoryWithStore(browserHistory, store);
const path = PlasticalSettings.URL.path || '/';

function renderApp() {
  let blogURL;
  let frontPageRoute;
  if (PlasticalSettings.frontPage.page) {
    blogURL = `${path}page/${PlasticalSettings.frontPage.blog}/`;
    frontPageRoute = <Route path={path} slug={PlasticalSettings.frontPage.page} component={SinglePage} />;
  } else {
    blogURL = path;
    frontPageRoute = null;
  }

  // Route onEnter
  const routes = (
    <Router history={history} render={applyRouterMiddleware(useScroll(), keyboardFocusReset('main'))}>
      <Route path={blogURL} component={Index} />
      <Route path={`${blogURL}p/:paged`} component={Index} />
      {frontPageRoute}
      <Route path={`${path}search/:search`} component={Search} />
      <Route path={`${path}category/:slug`} taxonomy="category" component={Term} />
      <Route path={`${path}category/:slug/p/:paged`} taxonomy="category" component={Term} />
      <Route path={`${path}tag/:slug`} taxonomy="post_tag" component={Term} />
      <Route path={`${path}tag/:slug/p/:paged`} taxonomy="post_tag" component={Term} />
      <Route path={`${path}date/:year`} component={DateArchive} />
      <Route path={`${path}date/:year/p/:paged`} component={DateArchive} />
      <Route path={`${path}date/:year/:month`} component={DateArchive} />
      <Route path={`${path}date/:year/:month/p/:paged`} component={DateArchive} />
      <Route path={`${path}date/:year/:month/:day`} component={DateArchive} />
      <Route path={`${path}date/:year/:month/:day/p/:paged`} component={DateArchive} />
      <Route path={`${path}page/**`} component={SinglePage} />
      <Route path={`${path}:year/:month/:slug`} component={SinglePost} />
      <Route path="*" component={NotFound} />
    </Router>
  );

  render(
    (
      <Provider store={store}>
        {routes}
      </Provider>
    ),
    document.getElementById('main')
  );

  render(
    (
      <Provider store={store}>
        <Navigation />
      </Provider>
    ),
    document.getElementById('site_navigation')
  );
}

// Set up link capture on all links in the app context.
function handleLinkClick() {
  jQuery('#page').on('click', 'a[rel!=external][target!=_blank]', (e) => {
    // Don't capture clicks in post content.
    if (jQuery(e.currentTarget).closest('.entry_content').length) {
      return;
    }
    // Don't capture clicks to wp-admin, or the RSS feed
    if (/wp-(admin|login)/.test(e.currentTarget.href) || /\/feed\/$/.test(e.currentTarget.href)) {
      return;
    }
    e.preventDefault();
    let url = e.currentTarget.href;

    url = url.replace(PlasticalSettings.URL.base, PlasticalSettings.URL.path);
    history.push(url);
  });

  jQuery('#page').on('click', 'a[href^="#"]', (e) => {
    skipLink(e.target);
  });
}

// If we have pre-loaded data, we know we're viewing the list of posts, and should pre-load it.
function renderPreloadData() {
  const actions = bindActionCreators({ setMenu, setPost, setPosts }, store.dispatch);
  actions.setMenu('primary', PlasticalMenu.data);

  if (PlasticalData.data.length > 1) {
    actions.setPosts(PlasticalData.data, PlasticalData.paging);
  } else if (PlasticalData.data.length) {
    const post = PlasticalData.data[0];
    actions.setPost(post);
  }
}
/* eslint prefer-arrow-callback: 1 */
document.addEventListener('DOMContentLoaded', function () {
  renderApp();
  renderPreloadData();
  handleLinkClick();
});
/* eslint prefer-arrow-callback: 1 */
