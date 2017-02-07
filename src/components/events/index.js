/* global PlasticalSettings */
// External dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import DocumentMeta from 'react-document-meta';
import ScrollIntoView from 'scroll-component';

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

  return ( 
    <section id="main" className="col700 center clearfix" role="main" aria-live="assertive" tabIndex="-1">

      <ScrollIntoView id="#container" />
      <DocumentMeta {...meta} />
      <BodyClass classes={['events']} />
      
      <QueryEvents query={props.query} />
      {props.loading ?
        <Placeholder type="events" /> :
        <div>
          <h1 className="page_title">{`${intl.formatMessage({ id: 'event.title' })} ${pag}`}</h1>
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
      
    </section>
  );
};

export default injectIntl(
  connect((state, ownProps) => {
    const locale = state.locale;
    const query = {};
    if (locale.lang !== 'en') {
      query.lang = locale.lang;
    }
    query.page = ownProps.params.paged || 1;
    query.order = 'asc';
    query.order_by = 'meta_value';
    query.meta_key = 'events_startdate';
    query.forthcoming = 1;

    let path = PlasticalSettings.URL.path || '/';
    if (PlasticalSettings.frontPage.page) {
      path += 'events/';
    }

    const events = getEventsForQuery(state, query) || [];
    const requesting = isRequestingEventsForQuery(state, query);
    return {
      locale,
      path,
      page: parseInt(query.page),
      query,
      events,
      requesting,
      loading: requesting && !events,
      totalPages: getTotalPagesForQuery(state, query),
    };
  })(Events)
);
