/* global PlasticalSettings */
import React from 'react';
import { connect } from 'react-redux';
import { updateIntl } from 'react-intl';
import DocumentMeta from 'react-document-meta';
import ScrollIntoView from 'scroll-component';

// Internal dependencies
import BodyClass from 'utils/react-body-class';
import QueryTerm from 'wordpress-query-term';
import { isRequestingTerm, getTermIdFromSlug, getTerm } from 'wordpress-query-term/lib/selectors';
import Placeholder from 'components/placeholder';
import List from './list';

const TermHeader = ({ term, taxonomy, loading, termData = {}, query = {} }) => {
  let pag = '';
  if (query.page > 1) {
    pag = `p. ${query.page}`;
  }
  
  const meta = {
    title: `${termData.name} ${pag} – ${PlasticalSettings.meta.title}`,
    description: termData.description,
  };

  return (
    <section id="main" className="col700 center clearfix" role="main" aria-live="assertive" tabIndex="-1">
      
      <ScrollIntoView id="#container" />  
      <DocumentMeta {...meta} />
      <BodyClass classes={['archive', taxonomy]} />
      <QueryTerm taxonomy={taxonomy} termSlug={term} />
      {loading ?
        <Placeholder /> :
        <div>            
          <h1 className="page_title">{`${termData.name} ${pag}`}</h1>
          {/* termData.description && <p>{termData.description}</p> */}
          <List query={query} taxonomy={taxonomy} term={term} title={termData.name} />
        </div>
      }

    </section>
  );
}

export default connect((state, ownProps) => {
  const locale = state.locale;
  const term = (locale.lang !== 'en') ? `${ownProps.params.slug}&lang=${locale.lang}` : ownProps.params.slug;
  const taxonomy = ownProps.taxonomy;
  const termId = getTermIdFromSlug(state, taxonomy, term) || 0;
  const termData = getTerm(state, termId);
  const requesting = isRequestingTerm(state, taxonomy, term);

  const query = {};
  if (locale.lang !== 'en') {
    query.lang = locale.lang;
  }

  query.page = ownProps.params.paged || 1;

  if (taxonomy === 'category') {
    query.categories = [termId];
  } else {
    query.tags = [termId];
  }
  
  return {
    locale,
    term,
    taxonomy,
    termData,
    requesting,
    query,
    loading: requesting && !termData
  };
})(TermHeader);
