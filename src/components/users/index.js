/* global PlasticalSettings */
// External dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { injectIntl } from 'react-intl';
import DocumentMeta from 'react-document-meta';
import ScrollIntoView from 'scroll-component';

// Internal dependencies
import BodyClass from 'utils/react-body-class';
import { getCapitalize } from 'utils/content-mixin';
import QueryUsers from 'wordpress-query-users';
import { isRequestingUsersForQuery, getUsersForQuery, getTotalPagesForQuery } from 'wordpress-query-users/lib/selectors';

// Components
import UserList from './list';
import Pagination from 'components/pagination/archive';
import Placeholder from 'components/placeholder';
import SubNav from 'components/navigation/sidebar';

class Users extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {  
    const props = this.props;
    const users = this.props.users;
    const intl = this.props.intl;

    const title = (props.query.current_status !== 'alumni') ? 
      `${intl.formatMessage({ id: 'user.users' })} ${props.query.city}` :
      'Alumni';

    const meta = {
      title,
      description: PlasticalSettings.meta.description,
      canonical: PlasticalSettings.URL.base,
    };

    return (        
      <div className="page">

        {(props.parentNavItem) ?
          <div className="back">
            <Link className="back_link" to={props.parentNavItem.url} >{props.parentNavItem.title}</Link>
            <span className="back_current">{title}</span>
            <div className="lightest_sep" />
          </div> :
          null
        }

        <aside id="sidebar" className="col220 first left clearfix" role="complementary">
          <SubNav filterId={props.navItemId} />
        </aside>

        <section id="main" className="col700 right last clearfix" role="main" aria-live="assertive" tabIndex="-1">
          <ScrollIntoView id="#container" /> 
          <DocumentMeta {...meta} />
          <BodyClass classes={['users']} />
          <QueryUsers query={props.query} />
          {props.loading ?
            <Placeholder type="users" /> :
            <UserList {...props} />
          }
          <Pagination
            path={props.path}
            length={users.length}
            current={props.page}
            isFirstPage={props.page === 1}
            isLastPage={props.page === props.totalPages}
            totalPages={props.totalPages}
          />
        </section>
      </div>
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

    console.log(path);

    const query = {};
    if (locale.lang !== 'en') {
      query.lang = locale.lang;
    }

    query.per_page = 50;
    query.page = ownProps.params.paged || 1;

    /* eslint no-undef: 1 */
    // Hacky, but it's the only way to find out if we need a sub navigation or not!
    let navItemId = 0;
    PlasticalMenu.data.map((item) => { 
      if (item.children.length > 0 && item.parent === 0 && item.url.includes('tecnopolo-ticino')) {
        navItemId = item.ID;
      }
    });
    const parentNavItem = PlasticalMenu.data.find(
      item => item.ID === navItemId
    )
    
    const isAlumni = ownProps.isAlumni || false;
    if (isAlumni) {
      query.meta_key = 'current_status';
      query.current_status = 'alumni';
    }
    let residence = ownProps.params.city || '';
    if (!isAlumni && residence !== '') {
      residence = getCapitalize(residence.toLowerCase());
      query.meta_key = 'city';
      query.city = residence;
    }

    const users = getUsersForQuery(state, query) || [];
    const requesting = isRequestingUsersForQuery(state, query);

    return {
      locale,
      path,
      page: parseInt(query.page),
      query,
      users,
      requesting,
      loading: requesting && !users,
      totalPages: getTotalPagesForQuery(state, query),
      navItemId,
      parentNavItem
    };
  })(Users)
);
