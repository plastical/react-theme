import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Match, Miss, Link, StaticRouter } from 'react-router';
import { intlShape, injectIntl } from 'react-intl';
import classNames from 'classnames';

// Internal
import { selectedLocale } from './i18n';
import { push, replace } from './routing';
import { requestMenu } from 'wordpress-query-menu/lib/state';

import Navigation from 'components/navigation';
import Slideshow from 'components/home/slideshow';
import Home from 'components/home';
import Posts from 'components/posts';
import SinglePost from 'components/post';
import SinglePage from 'components/post/page';
import Events from 'components/events';
import SingleEvent from 'components/event';
import Users from 'components/users';
import SingleUser from 'components/user';
import Term from 'components/term';
import Search from 'components/search';
import SearchForm from 'components/search/form';
import DateArchive from 'components/date';
import Contact from 'components/contact';
import NotFound from 'components/not-found';

// Accessibility!
import { keyboardFocusReset, skipLink } from 'utils/a11y';

function mapStateToProps(state) {
  return {
    location: state.routing.location,
    action: state.routing.action,
    locale: state.locale,
    menu: state.menu
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ 
    onPush: push,
    onReplace: replace,
    selectedLocale,
    requestMenu
  }, dispatch);
}

/* eslint react/forbid-prop-types: 1 no-shadow: 1 */
class Structure extends Component {
  static childContextTypes = {
    closeToggles: React.PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      isNavOpen: false,
      isSearchOpen: false,
      moved: false
    }
    this.toggleElements = this.toggleElements.bind(this); 
  }

  getChildContext() {
    return {
      closeToggles: (value) => this.closeToggles(value)
    };
  }

  closeToggles(value) {
    // update the state on nav click
    this.setState({ 
      isSearchOpen: value,
      isNavOpen: value
    });
  }

  toggleElements(e) {
    e.preventDefault();
    if (e.target.id === 'nav-toggle') {
      this.setState({ 
        isNavOpen: !this.state.isNavOpen,
        isSearchOpen: false
      })
    }
    if (e.target.id === 'search-toggle' || e.target.id === 'search-toggle-img') {    
      this.setState({ 
        isSearchOpen: !this.state.isSearchOpen,
        isNavOpen: false
      });
    }
    const scrollToEl = document.getElementById('header');
    scrollToEl.scrollIntoView();
  }

  /* eslint quote-props: 1 */
  render() {
    const { intl, selectedLocale, locale, settings, requestMenu } = this.props;
    let blogURL;
    let blogURLPaged;
    let frontPage;
    let slideshow;
    const path = settings.URL.path || '/';
    const languageSwitch = (locale.lang === 'en') ? '/it/' : '/';

    if (settings.frontPage.page) {
      if (settings.frontPage.blog) {   
        blogURL = <Match exactly pattern={`${path}page/${settings.frontPage.blog}/`} component={Posts} /> 
        blogURLPaged = <Match pattern={`${path}page/${settings.frontPage.blog}/p/:paged/`} component={Posts} />               
      } else {
        blogURL = null;
        blogURLPaged = null;
      }
      // Comment or uncomment according the kind of page you want to display.
      // frontPage = <Match exactly pattern={path} render={(props) => <SinglePage slug={settings.frontPage.page} {...props} />} />;
      slideshow = <Match exactly pattern={path} render={(props) => <Slideshow slug={settings.frontPage.page} {...props} />} />;
      frontPage = <Match exactly pattern={path} render={(props) => <Home slug={settings.frontPage.page} {...props} />} />;
    } else {
      blogURL = <Match exactly pattern={path} component={Posts} />
      blogURLPaged = <Match pattern={`${path}p/:paged/`} component={Posts} />               
      frontPage = null;
    }

    const navClasses = classNames({
      'nav': true,
      'show': this.state.isNavOpen,
      'active': this.state.isNavOpen,
    });

    const searchClasses = classNames({
      'search_container': true,
      'show': this.state.isSearchOpen,
      'active': this.state.isSearchOpen
    });

    return (
      <StaticRouter
        location={this.props.location}
        action={this.props.action}
        onPush={this.props.onPush}
        onReplace={this.props.onReplace}
      >
        <div id="inner-root">
          {slideshow} 
          <div id="container" className="site">
            <a id="t" href="#content" className="skip_link screen_reader_text">{intl.formatMessage({ id: 'structure.skip' })}</a>
            <header id="header" className="site_header" role="banner">
              <div id="inner-header" className="wrap clearfix">
                <button 
                  id="language"
                  className="language" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    window.location.assign(languageSwitch); 
                  }}
                >
                  <span>{intl.formatMessage({ id: 'structure.changeLanguageTo' })}</span>
                </button>              
                <button id="search-toggle" className={searchClasses} onClick={this.toggleElements}>
                  <svg id="search-toggle-img" ><use xlinkHref="/assets/layout/lens.svg#svg-lens" /></svg>
                </button>
                <button id="nav-toggle" className={navClasses} onClick={this.toggleElements}>&equiv;</button>
                <h1 id="logo"><Link to={path} rel="home"><img src="/assets/layout/logo.svg" alt="logo" /></Link></h1>              
                <div id="search-box" className={searchClasses} role="search" aria-live="assertive">
                  <SearchForm />
                </div>
                <nav id="navigation" className={navClasses} role="navigation" aria-live="assertive">      
                  <Navigation extended={false} />
                </nav>
              </div>    
            </header>{/* #masthead */}  
            <div id="content" className="site_content">
              {frontPage}{/* Guess what? The home page has custom styles... */}                             
              <div className="inner_content wrap clearfix">
                {/* Trailing slashes for custom routes are a mess!!! */} 
                <Match exactly pattern={`${path}events`} component={Events} />
                <Match exactly pattern={`${path}events/`} component={Events} /> 
                <Match pattern={`${path}events/p/:paged`} component={Events} />                     
                <Match pattern={`${path}events/p/:paged/`} component={Events} />   
                <Match exactly pattern={`${path}users`} component={Users} />             
                <Match exactly pattern={`${path}users/`} component={Users} />                         
                <Match pattern={`${path}users/p/:paged`} component={Users} />                       
                <Match pattern={`${path}users/p/:paged/`} component={Users} />
                <Match exactly pattern={`${path}residents/:city`} render={(props) => <Users {...props} />} />
                <Match exactly pattern={`${path}residents/:city/`} render={(props) => <Users {...props} />} />                   
                <Match pattern={`${path}residents/:city/p/:paged/`} render={(props) => <Users {...props} />} />
                <Match exactly pattern={`${path}alumni`} render={(props) => <Users isAlumni {...props} />} />
                <Match exactly pattern={`${path}alumni/`} render={(props) => <Users isAlumni {...props} />} />
                <Match pattern={`${path}alumni/p/:paged/`} render={(props) => <Users isAlumni {...props} />} />
                <Match exactly pattern={`${path}search/:search`} component={Search} />
                <Match exactly pattern={`${path}search/:search/`} component={Search} />
                <Match exactly pattern={`${path}search/:search/p/:paged/`} component={Search} />
                <Match exactly pattern={`${path}category/:slug/`} render={(props) => <Term taxonomy="category" {...props} />} />
                <Match pattern={`${path}category/:slug/p/:paged/`} render={(props) => <Term taxonomy="category" {...props} />} />
                <Match exactly pattern={`${path}tag/:slug/`} render={(props) => <Term taxonomy="post_tag" {...props} />} />
                <Match pattern={`${path}tag/:slug/p/:paged/`} render={(props) => <Term taxonomy="post_tag" {...props} />} />
                <Match exactly pattern={`${path}date/:year/`} component={DateArchive} />
                <Match pattern={`${path}date/:year/p/:paged/`} component={DateArchive} />
                <Match exactly pattern={`${path}date/:year/:month/`} component={DateArchive} />
                <Match pattern={`${path}date/:year/:month/p/:paged/`} component={DateArchive} />
                <Match exactly pattern={`${path}date/:year/:month/:day/`} component={DateArchive} />
                <Match pattern={`${path}date/:year/:month/:day/p/:paged/`} component={DateArchive} />
                <Match exactly pattern={`${path}contact/`} component={Contact} />
                <Match exactly pattern={`${path}page/**/`} component={SinglePage} />
                <Match exactly pattern={`${path}:year/:month/:day/:slug/`} component={SinglePost} />             
                <Match exactly pattern={`${path}events/:slug/`} component={SingleEvent} />                
                <Match exactly pattern={`${path}user/:slug/`} component={SingleUser} />
                {blogURL}
                {blogURLPaged}           
                <Miss component={NotFound} />
              </div>  
            </div>{/* #content */}

            <div className="push" />
            <footer id="footer" className="site_footer" role="contentinfo">
              <div id="inner-footer" className="wrap clearfix">
                <Link className="logo" to="#t" rel="home"><img src="/assets/layout/logo_inv.svg" alt="logo" /></Link>
                <nav id="footer-navigation" role="navigation" aria-live="assertive">
                  <Navigation extended />
                </nav>
                <div className="copyright">
                  <span>&copy;</span>
                  {`${new Date().getFullYear()} ${settings.meta.title}`}
                </div>
                <div className="credits">
                  Made by <a href="http://plastical.com" rel="designer">Plastical</a>
                </div>
              </div>
            </footer>{/* #footer */}

          </div>{/* #container */}
        </div>
      </StaticRouter>
    )
  }
}

Structure.propTypes = {
  location: PropTypes.object.isRequired,
  action: PropTypes.string.isRequired,
  onPush: PropTypes.func.isRequired,
  onReplace: PropTypes.func.isRequired,
  intl: intlShape.isRequired
}

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(Structure)
);
