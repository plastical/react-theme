/* global PlasticalSettings */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { injectIntl } from 'react-intl';
import classNames from 'classnames';
import DocumentMeta from 'react-document-meta';
import ScrollIntoView from 'scroll-component';

// Internal dependencies
import BodyClass from 'utils/react-body-class';
import QueryUsers from 'wordpress-query-users';
import { getUserIdFromSlug, isRequestingUser, getUser } from 'wordpress-query-users/lib/selectors';

// Components
import Placeholder from 'components/placeholder';

function isImage(url) {
  return (url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

function getTitle(data) {
  return { __html: data };
}

function getContent(data) {
  return { __html: data };
}

class SingleUser extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  renderUser() {
    const user = this.props.user;
    const intl = this.props.intl;

    if (!user) {
      return null;
    }

    const meta = {
      title: `${user.name} – ${PlasticalSettings.meta.title}`,
      description: `${user.meta.city}, ${user.meta.industry}`,
      canonical: user.link
    };
    
    const classes = classNames({
      entry: true,
      user: true
    });

    return (      
      <article id={`user-${user.id}`} className={classes}>
        <ScrollIntoView id="#container" /> 
        <DocumentMeta {...meta} />
        <BodyClass classes={['single', 'single_user']} />
        <div className="entry_content">          
          <div className="col300 first left clearfix">
            {user.meta.avatar ?
              <h1><img src={user.meta.avatar} alt={user.name} /><span className="hidden" dangerouslySetInnerHTML={getTitle(user.name)} /></h1> :
              null
            }          
            <h2 className="entry_title" dangerouslySetInnerHTML={getTitle(user.name)} />
            <p>
              {user.meta.street}<br />
              {user.meta.postal_code} {user.meta.city}
            </p>
            <div>
              {(user.meta.phone && user.meta.phone !== '-') ?
                <div>T.: {user.meta.phone}</div>
                : null
              }
              {(user.meta.contact_email) ?
                <div>E.: {user.meta.contact_email}</div>
                : null
              }
              {(user.meta.user_url) ?
                <div><a href={user.meta.user_url} target="_blank" rel="noopener noreferrer">{user.meta.user_url}</a></div>
                : null
              }
            </div>
            <p>
              {(user.meta.facebook) ?
                <span><a className="social" href={user.meta.facebook} target="_blank" title="Facebook" rel="noopener noreferrer"><svg viewBox="0 0 512 512"><path d="M211.9 197.4h-36.7v59.9h36.7V433.1h70.5V256.5h49.2l5.2-59.1h-54.4c0 0 0-22.1 0-33.7 0-13.9 2.8-19.5 16.3-19.5 10.9 0 38.2 0 38.2 0V82.9c0 0-40.2 0-48.8 0 -52.5 0-76.1 23.1-76.1 67.3C211.9 188.8 211.9 197.4 211.9 197.4z" /></svg></a></span>
                : null
              }
              {(user.meta.twitter) ?
                <span><a className="social" href={user.meta.twitter} target="_blank" title="Twitter" rel="noopener noreferrer"><svg viewBox="0 0 512 512"><path d="M419.6 168.6c-11.7 5.2-24.2 8.7-37.4 10.2 13.4-8.1 23.8-20.8 28.6-36 -12.6 7.5-26.5 12.9-41.3 15.8 -11.9-12.6-28.8-20.6-47.5-20.6 -42 0-72.9 39.2-63.4 79.9 -54.1-2.7-102.1-28.6-134.2-68 -17 29.2-8.8 67.5 20.1 86.9 -10.7-0.3-20.7-3.3-29.5-8.1 -0.7 30.2 20.9 58.4 52.2 64.6 -9.2 2.5-19.2 3.1-29.4 1.1 8.3 25.9 32.3 44.7 60.8 45.2 -27.4 21.4-61.8 31-96.4 27 28.8 18.5 63 29.2 99.8 29.2 120.8 0 189.1-102.1 185-193.6C399.9 193.1 410.9 181.7 419.6 168.6z" /></svg></a></span>
                : null
              }
              {(user.meta.linkedin) ?
                <span><a className="social" href={user.meta.linkedin} target="_blank" title="LinkedIn" rel="noopener noreferrer"><svg viewBox="0 0 512 512"><path d="M186.4 142.4c0 19-15.3 34.5-34.2 34.5 -18.9 0-34.2-15.4-34.2-34.5 0-19 15.3-34.5 34.2-34.5C171.1 107.9 186.4 123.4 186.4 142.4zM181.4 201.3h-57.8V388.1h57.8V201.3zM273.8 201.3h-55.4V388.1h55.4c0 0 0-69.3 0-98 0-26.3 12.1-41.9 35.2-41.9 21.3 0 31.5 15 31.5 41.9 0 26.9 0 98 0 98h57.5c0 0 0-68.2 0-118.3 0-50-28.3-74.2-68-74.2 -39.6 0-56.3 30.9-56.3 30.9v-25.2H273.8z" /></svg></a></span>
                : null
              }
              {(user.meta.googleplus) ?
                <span><a className="social" href={user.meta.googleplus} target="_blank" title="Google+" rel="noopener noreferrer"><svg viewBox="0 0 512 512"><path d="M179.7 237.6L179.7 284.2 256.7 284.2C253.6 304.2 233.4 342.9 179.7 342.9 133.4 342.9 95.6 304.4 95.6 257 95.6 209.6 133.4 171.1 179.7 171.1 206.1 171.1 223.7 182.4 233.8 192.1L270.6 156.6C247 134.4 216.4 121 179.7 121 104.7 121 44 181.8 44 257 44 332.2 104.7 393 179.7 393 258 393 310 337.8 310 260.1 310 251.2 309 244.4 307.9 237.6L179.7 237.6 179.7 237.6ZM468 236.7L429.3 236.7 429.3 198 390.7 198 390.7 236.7 352 236.7 352 275.3 390.7 275.3 390.7 314 429.3 314 429.3 275.3 468 275.3" /></svg></a></span>
                : null
              }
              {(user.meta.github) ?
                <span><a className="social" href={user.meta.github} target="_blank" title="GitHub" rel="noopener noreferrer"><svg viewBox="0 0 512 512"><path d="M256 70.7c-102.6 0-185.9 83.2-185.9 185.9 0 82.1 53.3 151.8 127.1 176.4 9.3 1.7 12.3-4 12.3-8.9V389.4c-51.7 11.3-62.5-21.9-62.5-21.9 -8.4-21.5-20.6-27.2-20.6-27.2 -16.9-11.5 1.3-11.3 1.3-11.3 18.7 1.3 28.5 19.2 28.5 19.2 16.6 28.4 43.5 20.2 54.1 15.4 1.7-12 6.5-20.2 11.8-24.9 -41.3-4.7-84.7-20.6-84.7-91.9 0-20.3 7.3-36.9 19.2-49.9 -1.9-4.7-8.3-23.6 1.8-49.2 0 0 15.6-5 51.1 19.1 14.8-4.1 30.7-6.2 46.5-6.3 15.8 0.1 31.7 2.1 46.6 6.3 35.5-24 51.1-19.1 51.1-19.1 10.1 25.6 3.8 44.5 1.8 49.2 11.9 13 19.1 29.6 19.1 49.9 0 71.4-43.5 87.1-84.9 91.7 6.7 5.8 12.8 17.1 12.8 34.4 0 24.9 0 44.9 0 51 0 4.9 3 10.7 12.4 8.9 73.8-24.6 127-94.3 127-176.4C441.9 153.9 358.6 70.7 256 70.7z" /></svg></a></span>
                : null
              }
            </p>
          </div>
          <div className="col620 right last clearfix">   
            <div className="bumper" />              
            <div><strong>{intl.formatMessage({ id: 'user.joined' })}</strong> {user.meta.joined}</div>
            {user.meta.industry ?
              <div><strong>{intl.formatMessage({ id: 'user.industry' })}</strong> {(this.props.locale.lang === 'it' && user.meta.industry === 'Other') ? 'Altro' : user.meta.industry}</div>
              : null
            }
            {user.meta.founded ?
              <div><strong>{intl.formatMessage({ id: 'user.founded' })}</strong> {user.meta.founded}</div>
              : null
            }
            {user.meta.founders ?              
              <div><p><strong>{intl.formatMessage({ id: 'user.founders' })}</strong><br />{user.meta.founders}</p></div>
              : null
            }
            {user.meta.team ?              
              <div><p><strong>Team:</strong><br />{user.meta.team}</p></div>
              : null
            }
            {(user.meta.descr_en && this.props.locale.lang === 'en') ?              
              <div><p><strong>Description:</strong></p>
                <div className="entry_content" dangerouslySetInnerHTML={getContent(user.meta.descr_en)} />
              </div>
              : null
            }
            {(user.meta.descr_it && this.props.locale.lang === 'it') ?              
              <div><p><strong>Descrizione:</strong></p>
                <div className="entry_content" dangerouslySetInnerHTML={getContent(user.meta.descr_it)} />
              </div>
              : null
            }
            {user.meta.awards ?
              <div><strong>{intl.formatMessage({ id: 'user.awards' })}</strong> {user.meta.awards}</div>
              : null
            }
            {user.meta.funds_rised ?
              <div><strong>{intl.formatMessage({ id: 'user.funds_rised' })}</strong> {user.meta.funds_rised}</div>
              : null
            }
            {(user.meta.file_1 && isImage(user.meta.file_1)) ?              
              <div><img src={user.meta.file_1} alt={user.meta.file_1} /></div>
              : null
            }
            {(user.meta.file_1 && !isImage(user.meta.file_1)) ?              
              <div><a href={user.meta.file_1} target="_blank" rel="noopener noreferrer">{user.meta.file_1}</a></div>
              : null
            }
            {(user.meta.file_2 && isImage(user.meta.file_2)) ?              
              <div><img src={user.meta.file_2} alt={user.meta.file_2} /></div>
              : null
            }
            {(user.meta.file_2 && !isImage(user.meta.file_2)) ?              
              <div><a href={user.meta.file_2} target="_blank" rel="noopener noreferrer">{user.meta.file_2}</a></div>
              : null
            }
            {(user.meta.file_3 && isImage(user.meta.file_3)) ?              
              <div><img src={user.meta.file_3} alt={user.meta.file_3} /></div>
              : null
            }
            {(user.meta.file_3 && !isImage(user.meta.file_3)) ?              
              <div><a href={user.meta.file_3} target="_blank" rel="noopener noreferrer">{user.meta.file_3}</a></div>
              : null
            }
            {(user.meta.file_4 && isImage(user.meta.file_4)) ?              
              <div><img src={user.meta.file_4} alt={user.meta.file_4} /></div>
              : null
            }
            {(user.meta.file_4 && !isImage(user.meta.file_4)) ?              
              <div><a href={user.meta.file_4} target="_blank" rel="noopener noreferrer">{user.meta.file_4}</a></div>
              : null
            }
            {(user.meta.file_5 && isImage(user.meta.file_5)) ?              
              <div><img src={user.meta.file_5} alt={user.meta.file_5} /></div>
              : null
            }
            {(user.meta.file_5 && !isImage(user.meta.file_5)) ?              
              <div><a href={user.meta.file_5} target="_blank" rel="noopener noreferrer">{user.meta.file_5}</a></div>
              : null
            }
          </div>
        </div>
      </article>
    );
  }

  renderBack() {
    const user = this.props.user;

    if (!user) {
      return null;
    }

    let backToList;
    if (user.meta.current_status === 'alumni') {
      backToList = this.props.parentNavItem.children.find((item) => {
        if (item.url.includes('alumni')) {
          return item;
        }
        return null;
      });
    } else {
      backToList = this.props.parentNavItem.children.find((item) => {        
        if (item.url.includes(user.meta.city.toLowerCase())) {
          return item;
        }
        return null;
      });
    }

    return (
      <div>
        {(this.props.parentNavItem) ?
          <div className="back">
            <Link className="back_link" to={this.props.parentNavItem.url} >{this.props.parentNavItem.title}</Link>
            {backToList ?
              <Link className="back_link" to={backToList.url} >{backToList.title}</Link> :
              null
            }
            <span className="back_current" dangerouslySetInnerHTML={getTitle(user.name)} />
            <div className="lightest_sep" />
          </div> : 
          null
        }
      </div>
    )
  }

  render() {
    return (
      <div className="page">

        {this.renderBack()}

        <section id="main" className="col780 center clearfix" role="main" aria-live="assertive" tabIndex="-1">

          <QueryUsers userSlug={this.props.slug} />
          {this.props.loading ?
            <Placeholder /> :
            this.renderUser()
          }

        </section>
      </div>
    );
  }
}

export default injectIntl(
  connect((state, ownProps) => {
    const locale = state.locale;
    const slug = ownProps.params.slug || false;

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

    const userId = getUserIdFromSlug(state, slug);
    const requesting = isRequestingUser(state, slug);
    const user = getUser(state, parseInt(userId));

    return {
      locale,
      slug,
      userId,
      user,
      requesting,
      loading: requesting && !user,
      navItemId,
      parentNavItem
    };
  })(SingleUser)
);
