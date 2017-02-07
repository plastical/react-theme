/* global PlasticalSettings */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { injectIntl } from 'react-intl';
import classNames from 'classnames';
import DocumentMeta from 'react-document-meta';
import ScrollIntoView from 'scroll-component';
import Slider from 'react-slick';

import 'slick-carousel/slick/slick.less';
import 'slick-carousel/slick/slick-theme.less';

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
import Post from '../posts/single';
import EventList from '../events/list';
import Media from '../post/image';
import Placeholder from 'components/placeholder';
import HomeWidget from './widget';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  renderBanner() {
    const { children, intl } = this.props;
    if (!children) {
      return null;
    }

    const settings = {
      arrows: false,
      dots: false,
      infinite: true,
      speed: 5000,
      slidesToShow: 1,
      autoplay: true,
      autoplaySpeed: 5000,
      fade: true,
      pauseOnHover: true
    }

    return (  
      <section id="banner">
        <Slider {...settings}>  
          {(this.props.children.length > 0) ?
            this.props.children.map((slide, i) => 
              <div 
                id={`child-${slide.id}`}
                key={slide.id} 
                className="banner_item"
                style={{ 
                  width: '100%',
                  backgroundImage: `url(${getFeaturedMedia(slide).source_url})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'cover'
                }}
              >
                <div className="wrap clearfix">
                  <div dangerouslySetInnerHTML={getEditLink(slide, intl.formatMessage({ id: 'content-mixin.edit' }))} />
                  <div className="banner_content" dangerouslySetInnerHTML={getContent(slide, this.props.intl.formatMessage({ id: 'content-mixin.passprotected' }))} />
                </div>
              </div>
            ) :
            <div />
          }         
        </Slider>        
      </section>
    )
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

    const featuredMedia = getFeaturedMedia(post);
    const editLink = getEditLink(post, intl.formatMessage({ id: 'content-mixin.edit' }));

    return (
      <section className="home_content">
        <DocumentMeta {...meta} />
        <BodyClass classes={['home']} />
        <HomeWidget slug={path} intl={intl} hideTitle />
      </section>
    );
  }

  renderPosts() {
    const { posts, intl } = this.props;
    const props = this.props;

    if (!posts) {
      return null;
    }

    const settings = {
      arrows: false,
      dots: true,
      infinite: true,
      speed: 5000,
      slidesToShow: 1,
      autoplay: true,
      autoplaySpeed: 5000,
      fade: true,
      pauseOnHover: true
    }

    return (  
      <Slider {...settings}> 
        {(posts.length > 0) ?
          posts.map((post, i) => 
            <div id={`post-${post.id}`} key={post.id}>
              <Post {...post} {...props} largeList />
            </div>
          ) :
          <div />
        }         
      </Slider> 
    )
  }

  render() {   
    const props = this.props;

    const classes = classNames({
      entry: true,      
    });

    return (  
      <div id="home" className={classes}>
        <ScrollIntoView id="#container" /> 
                 
        <QueryChildren query={props.childrenQuery} />
        {props.childrenLoading ?
          <Placeholder type="children" /> :
          this.renderBanner()
        }

        <div className="inner_content wrap clearfix">
          <section id="main" className="col940 center clearfix" role="main" aria-live="assertive" tabIndex="-1">
            
            <QueryPage pagePath={props.path} />
            {props.loading ?
              <Placeholder /> :
              this.renderHome()
            }

            <div className="bumper" />
            <div className="sep" />

            <section id="updates">

              <h1>{props.intl.formatMessage({ id: 'home.updates' })}</h1>

              <div className="home_news_list col480 first left clearfix">
                <QueryPosts query={props.postsQuery} />
                {props.postsLoading ?
                  <Placeholder /> :
                  <div>
                    <h5>{props.intl.formatMessage({ id: 'home.latest_news' })}</h5>
                    {this.renderPosts()}
                    <Link className="more" to={props.intl.formatMessage({ id: 'home.link_news' })}>{props.intl.formatMessage({ id: 'home.more_news' })}</Link>
                  </div>
                }
              </div>

              <div className="home_events_list col480 right last clearfix">
                <QueryEvents query={props.eventsQuery} />
                {props.eventsLoading ?
                  <Placeholder /> :
                  <div>
                    <h5>{props.intl.formatMessage({ id: 'home.forthcoming_events' })}</h5>
                    <EventList smallList {...props} />
                    <Link className="more" to={props.intl.formatMessage({ id: 'home.link_events' })}>{props.intl.formatMessage({ id: 'home.more_events' })}</Link>
                  </div>
                }
              </div>

            </section>

            <div className="bumper" />
            <div className="sep" />

            <section id="home-widgets">
            
              <div className="col480 first left clearfix">
                <HomeWidget slug="for-entrepreneurs" intl={props.intl} />
              </div>

              <div className="col480 right last clearfix">
                <HomeWidget slug="for-institutions" intl={props.intl} />
              </div>

              <div className="bumper" />
              <div className="sep" />

              <HomeWidget slug="partners" intl={props.intl} />

            </section>

          </section>
        </div>
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
    const eventsQuery = {};

    if (locale.lang !== 'en') {
      childrenQuery.lang = locale.lang;
      postsQuery.lang = locale.lang;
      eventsQuery.lang = locale.lang;
    }

    childrenQuery.parent = postId || 2; // Usually the first page is ID 2
    childrenQuery.order_by = 'menu';
    childrenQuery.order = 'asc';

    const children = getChildrenForQuery(state, childrenQuery) || [];
    const childrenRequesting = isRequestingChildrenForQuery(state, childrenQuery);

    postsQuery.page = ownProps.params.paged || 1;
    postsQuery.per_page = 3;
    postsQuery.sticky = true;

    const posts = getPostsForQuery(state, postsQuery) || [];
    const postsRequesting = isRequestingPostsForQuery(state, postsQuery);

    eventsQuery.page = ownProps.params.paged || 1;
    eventsQuery.per_page = 3;
    eventsQuery.order = 'asc';
    eventsQuery.order_by = 'meta_value';
    eventsQuery.meta_key = 'events_startdate';
    eventsQuery.feat_forthcoming = 1;

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
