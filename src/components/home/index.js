/* global PlasticalSettings */
import React, { Component } from 'react';
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

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {}
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
      <section className="home_highlight green_deco wrap clearfix" role="main" aria-live="assertive" tabIndex="-1">
        <div className="wrap clearfix">
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
        <QueryPage pagePath={props.path} />
        {props.loading ?
          <Placeholder /> :
          this.renderHome()
        }

        <section id="updates" className="inner_content wrap clearfix">
          <div className="home_list col780 center clearfix">
            <QueryEvents query={props.eventsQuery} />
            {props.eventsLoading ?
              <Placeholder /> :
              <div>
                <h1>{props.intl.formatMessage({ id: 'home.forthcoming_events' })}</h1>
                <EventList {...props} />
                <Link className="more" to={props.intl.formatMessage({ id: 'home.link_events' })}>{props.intl.formatMessage({ id: 'home.more_events' })}</Link>
              </div>
            }
          </div>

          <div className="bumper" />
          <div className="sep" />

          <div className="home_list col780 center clearfix">
            <QueryPosts query={props.postsQuery} />
            {props.postsLoading ?
              <Placeholder /> :
              <div>
                <h1>{props.intl.formatMessage({ id: 'home.latest_news' })}</h1>
                <PostList {...props} />
                <Link className="more" to={props.intl.formatMessage({ id: 'home.link_news' })}>{props.intl.formatMessage({ id: 'home.more_news' })}</Link>
              </div>
            }
          </div>                           
        </section>   

        <section className="home_highlight blue_deco wrap clearfix" role="main" aria-live="assertive" tabIndex="-1">
          <div className="col780 wrap center clearfix">
            <h1 className="tech_title increase"><img src="/assets/layout/tecnopolo_inv.svg" alt="logo" />{/* <strong>Tecnopolo®</strong> Ticino */}</h1>
            <HomeWidget slug="tecnopolo-ticino-home" intl={props.intl} hideTitle />
          </div>
        </section>   

        <section id="home-widgets" className="inner_content wrap clearfix">
          
          <div className="col480 first left clearfix">
            <HomeWidget slug="for-entrepreneurs" intl={props.intl} />
          </div>

          <div className="col480 right last clearfix">
            <HomeWidget slug="for-institutions" intl={props.intl} />
          </div>

          <div className="bumper" />
          <div className="sep" />

          <HomeWidget slug="members" intl={props.intl} />
        </section>

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
    if (locale.lang !== 'en') {
      path = `${path}&lang=${locale.lang}`;
    }

    const postId = getPageIdFromPath(state, path);   
    const requesting = isRequestingPage(state, path);
    const post = getPage(state, parseInt(postId));

    const childrenQuery = {};
    const postsQuery = {};
    const otherPostsQuery = {};
    const eventsQuery = {};

    if (locale.lang !== 'en') {
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
    postsQuery.categories = (locale.lang !== 'en') ? 3 : 1;

    const posts = getPostsForQuery(state, postsQuery) || [];
    const postsRequesting = isRequestingPostsForQuery(state, postsQuery);

    otherPostsQuery.page = ownProps.match.params.paged || 1;
    otherPostsQuery.per_page = 3;
    otherPostsQuery.categories = (locale.lang !== 'en') ? 7 : 6;

    const otherPosts = getPostsForQuery(state, otherPostsQuery) || [];
    const otherPostsRequesting = isRequestingPostsForQuery(state, otherPostsQuery);

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
      otherPostsPage: parseInt(postsQuery.page),
      otherPostsQuery,
      otherPosts,
      otherPostsRequesting,
      otherPostsLoading: otherPostsRequesting && !otherPosts,
      otherPostsTotalPages: getTotalPagesForQueryPosts(state, otherPostsQuery),
      eventsPage: parseInt(eventsQuery.page),
      eventsQuery,
      events,
      eventsRequesting,
      eventsLoading: eventsRequesting && !events,
      eventsTotalPages: getTotalPagesForQueryEvents(state, eventsQuery)
    };
  })(Home)
);
