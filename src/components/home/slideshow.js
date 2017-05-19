/* global PlasticalSettings */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import classNames from 'classnames';
import DocumentMeta from 'react-document-meta';
import ScrollIntoView from 'scroll-component';

// Internal dependencies
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

// Localstore
import { slideStore } from './slideStore';

const Slide = ({ intl, slide, active, idx, highlightSlide }) => {
  if (active) {
    slideStore.mergeState({ currentSlide: idx });
  }
  return ( 
    <article 
      id={`slide-${idx}`}
      key={idx} 
      style={{ 
        backgroundImage: `url(${getFeaturedMedia(slide).source_url})`
      }}
      className={(active) ? 'slide_item active' : 'slide_item'}
    />
  )
}

class Slideshow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stopSlide: true,
      activeId: 0
    }
    this.slideShow = this.slideShow.bind(this);
  }

  componentDidMount() {
    this.timerId = setInterval(() => this.slideShow(), 10000);
  }

  componentWillUnmount() {
    clearInterval(this.timerId);
  }

  slideShow() {
    if (this.props.slidesLength <= 1) {
      clearInterval(this.timerId);
    }
    let activeId = this.state.activeId;
    activeId += 1;
    if (activeId > this.props.slidesLength - 1) {
      activeId = 0;
    }
    this.setState({ activeId });
  }

  render() {   
    const { activeId } = this.state;
    const props = this.props;
    const intl = this.props.intl;

    if (!props.children && !props.events && !props.posts) {
      return null;
    }

    const tmpSlides = props.events.concat(props.posts);
    const slides = tmpSlides.concat(props.children);

    return (  
      <div id="slider" className="clearfix" data-type="background" data-speed="5">
        <QueryEvents query={props.eventsQuery} />
        <QueryPosts query={props.postsQuery} />
        <QueryChildren query={props.childrenQuery} />
        
        {(props.eventsRequesting || props.postsRequesting || props.childrenRequesting) ?
          <Placeholder /> :
          null
        } 

        {(props.eventsLoading || props.postsLoading || props.childrenLoading) ?
          null :
          slides.map((slide, i) => 
            <Slide key={slide.id} active={activeId === i} idx={slide.id} slide={slide} intl={props.intl} cont={this.context} highlightSlide={(value) => this.props.cbHighlightSlide(value)} />
          )
        } 
        {(props.slides) ?
          <ScrollIntoView id="#slider" /> :
          null
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
    const eventsQuery = {};

    if (locale.lang !== 'it') {
      childrenQuery.lang = locale.lang;
      postsQuery.lang = locale.lang;
      eventsQuery.lang = locale.lang;
    }

    childrenQuery.parent = postId || 2; // Usually the first page is ID 2
    childrenQuery.order_by = 'menu';
    childrenQuery.order = 'asc';

    const children = getChildrenForQuery(state, childrenQuery) || [];
    const childrenRequesting = isRequestingChildrenForQuery(state, childrenQuery);

    postsQuery.page = ownProps.match.params.paged || 1;
    postsQuery.per_page = 3;
    postsQuery.sticky = true;

    const posts = getPostsForQuery(state, postsQuery) || [];
    const postsRequesting = isRequestingPostsForQuery(state, postsQuery);

    eventsQuery.page = ownProps.match.params.paged || 1;
    eventsQuery.per_page = 3;
    eventsQuery.order = 'asc';
    eventsQuery.order_by = 'meta_value';
    eventsQuery.meta_key = 'events_startdate';
    eventsQuery.feat_forthcoming = 1;

    const events = getEventsForQuery(state, eventsQuery) || [];
    const eventsRequesting = isRequestingEventsForQuery(state, eventsQuery);

    const slidesLength = events.length + posts.length + children.length;

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
      eventsTotalPages: getTotalPagesForQueryEvents(state, eventsQuery),
      slidesLength,
    };
  })(Slideshow)
);
