import { combineReducers } from 'redux';
import createBrowserHistory from 'history/createBrowserHistory';
import { routerReducer } from 'react-router-redux';
import { localeReducer } from './i18n';
import posts from 'wordpress-query-posts/lib/state';
import pages from 'wordpress-query-page/lib/state';
import children from 'wordpress-query-page-children/lib/state';
import events from 'wordpress-query-custom-posts-events/lib/state';
import terms from 'wordpress-query-term/lib/state';
import comments from 'wordpress-query-comments/lib/state';
import users from 'wordpress-query-users/lib/state';
import menu from 'wordpress-query-menu/lib/state';

export const history = createBrowserHistory();

export default combineReducers({ router: routerReducer, locale: localeReducer, posts, pages, children, events, terms, comments, users, menu });
