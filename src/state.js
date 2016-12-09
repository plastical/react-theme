import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { routerReducer } from 'react-router-redux';
import posts from 'wordpress-query-posts/lib/state';
import pages from 'wordpress-query-page/lib/state';
import terms from 'wordpress-query-term/lib/state';
import comments from 'wordpress-query-comments/lib/state';
import users from 'wordpress-query-users/lib/state';
import menu from 'wordpress-query-menu/lib/state';

const reducer = combineReducers({ posts, pages, terms, comments, users, menu, routing: routerReducer });

const middleware = [thunkMiddleware];

let createStoreWithMiddleware = applyMiddleware.apply(null, middleware);

/* eslint prefer-spread: 1 import/prefer-default-export: 1 */
export function createReduxStore(initialState = {}) {
  if (typeof window === 'object' && window.devToolsExtension) {
    createStoreWithMiddleware = compose(createStoreWithMiddleware, window.devToolsExtension());
  }
  return createStoreWithMiddleware(createStore)(reducer, initialState);
}
