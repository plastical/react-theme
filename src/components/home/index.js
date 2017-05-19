/* global PlasticalSettings */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import classNames from 'classnames';
import DocumentMeta from 'react-document-meta';
import he from 'he';

// Internal dependencies
import BodyClass from 'utils/react-body-class';
import QueryPage from 'wordpress-query-page';
import { getPageIdFromPath, isRequestingPage, getPage } from 'wordpress-query-page/lib/selectors';
import QueryChildren from 'wordpress-query-page-children';
import { isRequestingChildrenForQuery, getChildrenForQuery, getTotalChildrenForQuery } from 'wordpress-query-page-children/lib/selectors';
import QueryPosts from 'wordpress-query-posts';
import { isRequestingPostsForQuery, getPostsForQuery, getTotalPagesForQuery as getTotalPagesForQueryPosts } from 'wordpress-query-posts/lib/selectors';
import QueryEvents from 'wordpress-query-custom-posts-events';
import { isRequestingEventsForQuery, getEventsForQuery, getTotalPagesForQuery as getTotalPagesForQueryEvents } from 'wordpress-query-custom-posts-events/lib/selectors';
import { getTitle, getDate, getExcerpt, getContent, getFeaturedMedia, getEditLink } from 'utils/content-mixin';

// Components
import PostList from '../posts/list';
import EventList from '../events/list';
import Media from '../post/image';
import Placeholder from 'components/placeholder';
import HomeWidget from './widget';

// Localstore
import { slideStore } from './slideStore';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentSlide: 0
    }
  }

  componentDidMount() {
    this.timerId = setInterval(() => this.highlightSlide(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerId);
  }

  highlightSlide() {
    this.setState({ currentSlide: slideStore.getState().currentSlide });
  }

  renderHome() {
    const { post, intl, location, path } = this.props;

    if (!post) {
      return null;
    } 

    const meta = {
      title: `${post.title.rendered} – ${PlasticalSettings.meta.title}`,
      description: post.excerpt.rendered,
      canonical: post.link
    }; 
    meta.title = he.decode(meta.title);

    const featuredMedia = getFeaturedMedia(post);
    const editLink = getEditLink(post, intl.formatMessage({ id: 'content-mixin.edit' }));

    return (
      <section className="wrap clearfix" role="main" aria-live="assertive" tabIndex="-1">
        <div className="clearfix">
          <DocumentMeta {...meta} />
          <BodyClass classes={['home']} />
          <HomeWidget slug={path} intl={intl} hideTitle />
        </div>
      </section>
    );
  }

  render() {   
    const props = this.props;

    const classes = classNames({
      entry: true,      
    });

    return (  
      <div id="home" className={classes}>

        <section id="updates" className="inner_content wrap clearfix">
          <div className="home_list col480 first left clearfix">
            <QueryPosts query={props.postsQuery} />
            {props.postsLoading ?
              <Placeholder /> :
              <div>
                <h3>{props.intl.formatMessage({ id: 'home.latest_news' })}</h3>
                <PostList {...props} currentSlide={this.state.currentSlide} />
              </div>
            }
          </div>

          <div className="home_list col480 right last clearfix">            
            <QueryEvents query={props.eventsQuery} />
            {props.eventsLoading ?
              <Placeholder /> :
              <div>
                <h3>{props.intl.formatMessage({ id: 'home.forthcoming_events' })}</h3>
                <EventList {...props} currentSlide={this.state.currentSlide} />
              </div>
            }
          </div>                           
        </section>   

        <div className="bumper" />
        <div className="wrap light_sep" />

        <QueryPage pagePath={props.path} />
        {props.loading ?
          <Placeholder /> :
          this.renderHome()
        }

      </div>
    )
  }
}

export default injectIntl(
  connect((state, ownProps) => {   
    const locale = state.locale; 
    let path = ownProps.slug || ownProps.pathname; // In case, this is the slug for the homepage

    if (path[path.length - 1] === '/') {
      path = path.slice(0, -1);
    }
    if (locale.lang !== 'it') {
      path = `${path}&lang=${locale.lang}`;
    }

    const postId = getPageIdFromPath(state, path);   
    const requesting = isRequestingPage(state, path);
    const post = getPage(state, parseInt(postId));

    const childrenQuery = {};
    const postsQuery = {};
    const otherPostsQuery = {};
    const eventsQuery = {};

    if (locale.lang !== 'it') {
      childrenQuery.lang = locale.lang;
      postsQuery.lang = locale.lang;
      otherPostsQuery.lang = locale.lang;
      eventsQuery.lang = locale.lang;
    }

    childrenQuery.parent = postId || 2; // Usually the first page is ID 2
    childrenQuery.order_by = 'menu';
    childrenQuery.order = 'asc';

    const children = getChildrenForQuery(state, childrenQuery) || [];
    const childrenRequesting = isRequestingChildrenForQuery(state, childrenQuery);

    postsQuery.page = ownProps.match.params.paged || 1;
    postsQuery.per_page = 3;

    const posts = getPostsForQuery(state, postsQuery) || [];
    const postsRequesting = isRequestingPostsForQuery(state, postsQuery);

    eventsQuery.page = ownProps.match.params.paged || 1;
    eventsQuery.per_page = 3;
    eventsQuery.orderby = 'meta_value'; /* orderby vs. order_by !!!! */
    eventsQuery.order = 'asc';
    eventsQuery.meta_key = 'events_startdate';
    eventsQuery.forthcoming = 1;

    const events = getEventsForQuery(state, eventsQuery) || [];
    const eventsRequesting = isRequestingEventsForQuery(state, eventsQuery);

    return {
      locale,
      path,
      postId,
      post,
      requesting,
      loading: requesting && !post,
      childrenQuery,
      children,
      childrenRequesting,
      childrenLoading: childrenRequesting && !children,
      childrenTotalPages: getTotalChildrenForQuery(state, childrenQuery),
      postsPage: parseInt(postsQuery.page),
      postsQuery,
      posts,
      postsRequesting,
      postsLoading: postsRequesting && !posts,
      postsTotalPages: getTotalPagesForQueryPosts(state, postsQuery),
      eventsPage: parseInt(eventsQuery.page),
      eventsQuery,
      events,
      eventsRequesting,
      eventsLoading: eventsRequesting && !events,
      eventsTotalPages: getTotalPagesForQueryEvents(state, eventsQuery)
    };
  })(Home)
);
