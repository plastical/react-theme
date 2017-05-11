/* global PlasticalSettings */
// External dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import DocumentMeta from 'react-document-meta';
import ScrollIntoView from 'scroll-component';
import he from 'he';

// Internal dependencies
import BodyClass from 'utils/react-body-class';
import QueryEvents from 'wordpress-query-custom-posts-events';
import { isRequestingEventsForQuery, getEventsForQuery, getTotalPagesForQuery } from 'wordpress-query-custom-posts-events/lib/selectors';

// Components
import EventList from './list';
import Pagination from 'components/pagination/archive';
import Placeholder from 'components/placeholder';

const Events = (props) => {
  const events = props.events;
  const pastEvents = props.pastEvents;
  const intl = props.intl;

  let pag = '';
  if (props.page > 1) {
    pag = `p. ${props.page}`;
  }

  const meta = {
    title: `${intl.formatMessage({ id: 'event.title' })} ${pag} – ${PlasticalSettings.meta.title}`,
    description: PlasticalSettings.meta.description,
    canonical: PlasticalSettings.URL.base,
  };
  meta.title = he.decode(meta.title);

  return ( 
    <section id="main" className="col700 center clearfix" role="main" aria-live="assertive" tabIndex="-1">

      <ScrollIntoView id="#container" />
      <DocumentMeta {...meta} />
      <BodyClass classes={['events']} />
      <h1 className="page_title">{`${intl.formatMessage({ id: 'event.title' })} ${pag}`}</h1>            
      <div>
        <QueryEvents query={props.query} />
        {props.loading ?
          <Placeholder type="events" /> :
          <div>
            <h3 className="page_title">{`${intl.formatMessage({ id: 'event.forthcoming' })} ${pag}`}</h3>
            <EventList mediumList {...props} />
          </div>
        }
        <Pagination
          path={props.path}
          length={events.length}
          current={props.page}
          isFirstPage={props.page === 1}
          isLastPage={props.page === props.totalPages}
          totalPages={props.totalPages}
          intl={props.intl}
        />
      </div>
      <div className="bumper" />
      <div className="sep" />
      <div className="bumper" />

      <div>
        <QueryEvents query={props.pastQuery} />
        {props.pastLoading ?
          <Placeholder type="events" /> :
          <div>
            <h3 className="page_title">{`${intl.formatMessage({ id: 'event.past' })} ${pag}`}</h3>
            <EventList smallList past {...props} />
          </div>
        }
        <Pagination
          path={props.path}
          length={pastEvents.length}
          current={props.pastPage}
          isFirstPage={props.pastPage === 1}
          isLastPage={props.pastPage === props.pastTotalPages}
          totalPages={props.pastTotalPages}
          intl={props.intl}
        />
      </div>
      
    </section>
  );
};

export default injectIntl(
  connect((state, ownProps) => {
    const locale = state.locale;
    const query = {};
    const pastQuery = {};

    if (locale.lang !== 'en') {
      query.lang = locale.lang;
      pastQuery.lang = locale.lang;
    }

    query.page = 1;
    query.per_page = 50;
    query.order = 'asc';
    query.orderby = 'meta_value';
    query.meta_key = 'events_startdate';
    query.forthcoming = 1;

    pastQuery.page = ownProps.match.params.paged || 1;
    pastQuery.order = 'desc';
    pastQuery.orderby = 'meta_value';
    pastQuery.meta_key = 'events_enddate';
    pastQuery.past = 1;

    let path = PlasticalSettings.URL.path || '/';
    if (PlasticalSettings.frontPage.page) {
      path += 'events/';
    }

    const events = getEventsForQuery(state, query) || [];
    const requesting = isRequestingEventsForQuery(state, query);

    const pastEvents = getEventsForQuery(state, pastQuery) || []; 
    const pastRequesting = isRequestingEventsForQuery(state, pastQuery);

    return {
      locale,
      path,
      page: parseInt(query.page),
      query,
      events,
      requesting,
      loading: requesting && !events,
      totalPages: getTotalPagesForQuery(state, query),
      pastPage: parseInt(pastQuery.page),
      pastQuery,
      pastEvents,
      pastRequesting,
      pastLoading: pastRequesting && !pastEvents,
      pastTotalPages: getTotalPagesForQuery(state, pastQuery),
    };
  })(Events)
);
