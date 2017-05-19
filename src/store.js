import { createStore, applyMiddleware, compose } from 'redux';
import ReactGA from 'react-ga';
import { routerMiddleware as createRouterMiddleware, push } from 'react-router-redux';
import thunkMiddleware from 'redux-thunk';

import rootReducer, { history } from './reducer';

import { addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
import it from 'react-intl/locale-data/it';

const routerMiddleware = createRouterMiddleware(history);

addLocaleData([...en, ...it])

/* eslint-disable no-underscore-dangle */
const composeEnhancers =
  process.env.NODE_ENV !== 'production' &&
  typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?   
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
    // Specify here name, actionsBlacklist, actionsCreators and other options
  }) : compose;

const enhancer = composeEnhancers(
  applyMiddleware(thunkMiddleware, routerMiddleware),
  // other store enhancers if any
);

ReactGA.initialize('UA-2185125-66');

history.listen((location, action) => {
  ReactGA.set({ page: location.pathname });
  ReactGA.pageview(location.pathname);
});

// Create the store
const store = createStore(rootReducer, enhancer);

// syncHistoryWithStore(history, store)

// Expose these globally for dev purposes
window.h = history
window.push = push

export default store;
