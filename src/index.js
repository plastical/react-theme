/* global PlasticalSettings, PlasticalData, PlasticalMenu, jQuery */
// Load in the babel (es6) polyfill, and fetch polyfill
import 'babel-polyfill';
import 'whatwg-fetch';

// React
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { bindActionCreators } from 'redux';

// Load the CSS
require('../less/base.less');
require('../less/style.less');

// Internal dependecies
import Structure from './structure';
import store from './store';
import { IntlReduxProvider, selectedLocale } from './i18n';
import { setMenu } from 'wordpress-query-menu/lib/state';

// Accessibility
import { skipLink } from 'utils/a11y';


function renderApp() {
  render(
    <Provider store={store}>
      <IntlReduxProvider>
        <Structure settings={PlasticalSettings} />
      </IntlReduxProvider>
    </Provider>,
    document.getElementById('root')
  );
}

// Set up link capture on all links in the app context.
function handleURLs() {
  if (location.pathname.substr(-1) !== '/') {    
    window.h.push(`${location.pathname}/`);
  }

  jQuery('#container').on('click', 'a[rel!=external][target!=_blank]', (e) => {
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
    
    // get global history from ./store
    window.h.push(url); 
  });

  // anchor scroll
  jQuery('#container').on('click', 'a[href^="#"]', (e) => {
    skipLink(e.target);
  });
}

// If we have pre-loaded data, we know we're viewing the list of posts, events and locale, and should pre-load it.
function renderPreloadData() {
  const actions = bindActionCreators({ setMenu, selectedLocale }, store.dispatch);
  actions.selectedLocale(PlasticalSettings.lang);
  actions.setMenu(`primary-${PlasticalSettings.lang}`, PlasticalMenu.data);
}

function detectScroll() {
  jQuery(window).scroll(() => {
    const winPosition = jQuery(window).scrollTop();

    if (winPosition > 5) {
      jQuery('#header').addClass('moved');
    } else {
      jQuery('#header').removeClass('moved');
    }
  });
}

/* eslint prefer-arrow-callback: 1 no-unused-expressions: 1 */
document.addEventListener('DOMContentLoaded', function () {
  if (!global.Intl) {
    require.ensure(['intl'], require => {
      require('intl').default;
      renderApp();
      renderPreloadData();
      handleURLs();
      detectScroll();
    }, 'IntlBundle');
  } else { 
    renderApp();
    renderPreloadData();
    handleURLs();
    detectScroll();
  }
});

// Install ServiceWorker and AppCache in the end since
// it's not the most important operation and if main code fails,
// we do not want it installed
if (process.env.NODE_ENV === 'production') {
  require('offline-plugin/runtime').install(); // eslint-disable-line global-require
}
