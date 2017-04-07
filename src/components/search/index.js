/* global PlasticalSettings */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect, Link } from 'react-router';
import { injectIntl } from 'react-intl';
import classNames from 'classnames';
import DocumentMeta from 'react-document-meta';
import ScrollIntoView from 'scroll-component';

// Internal dependencies
import { getTitle, getEditLink, getContent, getDate, getExcerpt, getFeaturedMedia } from 'utils/content-mixin';
import BodyClass from 'utils/react-body-class';
import QueryUsers from 'wordpress-query-users';
import { isRequestingUsersForQuery, getUsersForQuery, getTotalPagesForQuery as getTotalPagesForQueryUsers } from 'wordpress-query-users/lib/selectors';
import QueryEvents from 'wordpress-query-custom-posts-events';
import { isRequestingEventsForQuery, getEventsForQuery, getTotalPagesForQuery as getTotalPagesForQueryEvents } from 'wordpress-query-custom-posts-events/lib/selectors';
import QueryChildren from 'wordpress-query-page-children';
import { isRequestingChildrenForQuery, getChildrenForQuery, getTotalChildrenForQuery } from 'wordpress-query-page-children/lib/selectors';
import QueryPosts from 'wordpress-query-posts';
import { isRequestingPostsForQuery, getPostsForQuery, getTotalPagesForQuery as getTotalPagesForQueryPosts } from 'wordpress-query-posts/lib/selectors';

// Components
import UserList from 'components/users/list';
import EventList from 'components/events/list';
import PostList from 'components/posts/list';
import Pagination from 'components/pagination/archive';
import Placeholder from 'components/placeholder';

const PageList = (props) => {
  if (!props.pages) {
    return null;
  }

  const pages = props.pages.map((page, i) => 
    <PageInList key={`page-${i}`} {...page} {...props} />
  );

  return (
    <div className="entry_list">
      {pages.length > 0 || props.noPreload ?
        pages :
        <Placeholder />
      }  
    </div>
  );
}

const PageInList = (props) => {
  const page = props;
  const intl = props.intl;

  if (page.type === 'attachment') {
    return null;
  }

  const classes = classNames({
    entry: true
  });

  const path = page.link.replace(PlasticalSettings.URL.base, PlasticalSettings.URL.path);
  const editLink = getEditLink(page, intl.formatMessage({ id: 'content-mixin.edit' }));

  return (
    <article id={`page-${page.id}`} className={classes}>
      <div className="entry_main">
        <h2 className="entry_title">
          <Link className="entry_link" to={path} rel="bookmark" dangerouslySetInnerHTML={getTitle(page)} />
        </h2>        
        <div className="entry_meta">   
          {editLink ?
            <p dangerouslySetInnerHTML={editLink} /> :
            null
          }
        </div>
        <div className="entry_content" dangerouslySetInnerHTML={getExcerpt(page)} /> 
      </div>  
    </article>       
  );
}

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
    this.getSearchValue = this.getSearchValue.bind(this);
  }

  getSearchValue() {
    return this.props.params.search;
  }

  render() {
    const props = this.props;
    const users = this.props.users;
    const events = this.props.events;
    const pages = this.props.pages;
    const posts = this.props.posts;

    const intl = this.props.intl;

    const term = this.getSearchValue();

    const meta = {
      title: `${intl.formatMessage({ id: 'search.search_results' })} ${term} – ${PlasticalSettings.meta.title}`
    };

    return (
      <section id="main" className="clearfix" role="main" aria-live="assertive" tabIndex="-1">

        <ScrollIntoView id="#container" /> 
        <DocumentMeta {...meta} />
        <BodyClass classes={['search']} />

        <header className="content_header">
          <h1 className="content_title">{intl.formatMessage({ id: 'search.search_results' })} {term}</h1>
        </header>

        <div className="bumper" />

        <div className="col940 center clearfix">

          <div className="search_results col480 first left clearfix">
            <h5>{intl.formatMessage({ id: 'search.users' })}</h5>
            <QueryUsers query={this.props.usersQuery} />
            {(this.props.usersLoading) ?
              <Placeholder /> :
              <UserList users={users} {...props} status smallList noPreload />
            }
            {this.props.usersTotalPages > 1 ? 
              <Pagination
                path={this.props.path}
                length={users.length}
                current={this.props.usersPage}
                isFirstPage={this.props.usersPage === 1}
                isLastPage={this.props.usersPage === this.props.usersTotalPages}
                totalPages={this.props.usersTotalPages}
                intl
              /> : 
              null
            }   
            {!this.props.usersRequesting && users.length === 0 && this.props.usersTotalPages <= 1 ?
              <p>{intl.formatMessage({ id: 'search.no_results' })}</p> :
              null
            }
          </div>
          
          <div className="search_results col480 right last clearfix">
            <h5>{intl.formatMessage({ id: 'search.events' })}</h5>
            <QueryEvents query={this.props.eventsQuery} />        
            {(this.props.eventsLoading) ?
              <Placeholder /> :
              <EventList events={events} {...props} smallList noPreload />
              }
            {this.props.eventsTotalPages > 1 ? 
              <Pagination
                path={this.props.path}
                length={events.length}
                current={this.props.eventsPage}
                isFirstPage={this.props.eventsPage === 1}
                isLastPage={this.props.eventsPage === this.props.eventsTotalPages}
                totalPages={this.props.eventsTotalPages}
                intl
              /> : 
              null
            }  
            {!this.props.eventsRequesting && events.length === 0 && this.props.eventsTotalPages <= 1 ?
              <p>{intl.formatMessage({ id: 'search.no_results' })}</p> :
              null
            }          
          </div>

          <div style={{ clear: 'both' }} />

          <div className="search_results col480 first left clearfix">
            <h5>{intl.formatMessage({ id: 'search.pages' })}</h5>
            <QueryChildren query={this.props.pagesQuery} />
            {(this.props.pagesLoading) ?
              <Placeholder /> :
              <PageList pages={pages} {...props} smallList noPreload />                           
            }
            {this.props.pagesTotalPages > 1 ?
              <Pagination
                path={this.props.path}
                length={pages.length}
                current={this.props.pagesPage}
                isFirstPage={this.props.pagesPage === 1}
                isLastPage={this.props.pagesPage === this.props.pagesTotalPages}
                totalPages={this.props.pagesTotalPages}
                intl
              /> :
              null
            }  
            {!this.props.pagesRequesting && pages.length === 0 && this.props.pagesTotalPages <= 1 ?
              <p>{intl.formatMessage({ id: 'search.no_results' })}</p> :
              null
            }
          </div>

          <div className="search_results col480 right last clearfix">
            <h5>{intl.formatMessage({ id: 'search.posts' })}</h5>
            <QueryPosts query={this.props.postsQuery} />
            {(this.props.postsLoading) ?
              <Placeholder /> :
              <PostList posts={posts} {...props} smallList noPreload />                           
            }
            {this.props.postsTotalPages > 1 ?
              <Pagination
                path={this.props.path}
                length={posts.length}
                current={this.props.postsPage}
                isFirstPage={this.props.postsPage === 1}
                isLastPage={this.props.postsPage === this.props.postsTotalPages}
                totalPages={this.props.postsTotalPages}
                intl
              /> :
              null
            }  
            {!this.props.postsRequesting && posts.length === 0 && this.props.postsTotalPages <= 1 ?
              <p>{intl.formatMessage({ id: 'search.no_results' })}</p> :
              null
            }
          </div>

        </div>

      </section>
    );
  } 
}

export default injectIntl(
  connect((state, ownProps) => {
    const locale = state.locale;

    let path = ownProps.pathname;

    if (ownProps.params.paged) {
      path = path.substr(0, path.indexOf('/p/'));
      path = `${path}/`;
    }

    const usersQuery = {};
    const eventsQuery = {};
    const pagesQuery = {};
    const postsQuery = {};


    if (locale.lang !== 'en') {
      usersQuery.lang = locale.lang;
      eventsQuery.lang = locale.lang;
      pagesQuery.lang = locale.lang;
      postsQuery.lang = locale.lang;
    }

    usersQuery.page = ownProps.params.paged || 1;
    usersQuery.search = ownProps.params.search || '';

    eventsQuery.page = ownProps.params.paged || 1;
    eventsQuery.search = ownProps.params.search || '';

    pagesQuery.page = ownProps.params.paged || 1;
    pagesQuery.search = ownProps.params.search || '';
    pagesQuery.status = 'publish';

    postsQuery.page = ownProps.params.paged || 1;
    postsQuery.search = ownProps.params.search || '';

    
    const users = getUsersForQuery(state, usersQuery) || [];
    const usersRequesting = isRequestingUsersForQuery(state, usersQuery);

    const events = getEventsForQuery(state, eventsQuery) || [];
    const eventsRequesting = isRequestingEventsForQuery(state, eventsQuery);

    const pages = getChildrenForQuery(state, pagesQuery) || [];
    const pagesRequesting = isRequestingChildrenForQuery(state, pagesQuery);

    const posts = getPostsForQuery(state, postsQuery) || [];
    const postsRequesting = isRequestingPostsForQuery(state, postsQuery);

    return {
      locale,
      path,
      usersLength: users.length,
      usersPage: parseInt(usersQuery.page),
      usersQuery,
      users,
      usersRequesting,
      usersLoading: usersRequesting && !users,
      usersTotalPages: getTotalPagesForQueryUsers(state, usersQuery),
      eventsLength: events.length,
      eventsPage: parseInt(eventsQuery.page),
      eventsQuery,
      events,
      eventsRequesting,
      eventsLoading: eventsRequesting && !events,
      eventsTotalPages: getTotalPagesForQueryEvents(state, eventsQuery),
      pagesLength: pages.length,
      pagesPage: parseInt(postsQuery.page),
      pagesQuery,
      pages,
      pagesRequesting,
      pagesLoading: pagesRequesting && !pages,
      pagesTotalPages: getTotalChildrenForQuery(state, pagesQuery),
      postsLength: posts.length,
      postsPage: parseInt(postsQuery.page),
      postsQuery,
      posts,
      postsRequesting,
      postsLoading: postsRequesting && !posts,
      postsTotalPages: getTotalPagesForQueryPosts(state, postsQuery),
    };
  })(Search)
);
