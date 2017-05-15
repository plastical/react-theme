import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter, BrowserRouter, Route, Switch, Link } from 'react-router-dom';
import { intlShape, injectIntl } from 'react-intl';
import classNames from 'classnames';

// Internal
import { selectedLocale } from './i18n';
import { history } from './reducer';
import { ConnectedRouter, push } from 'react-router-redux';
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
    locale: state.locale,
    menu: state.menu
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ 
    onPush: push,
    selectedLocale,
    requestMenu
  }, dispatch);
}

/* eslint react/forbid-prop-types: 1 no-shadow: 1 */
class Structure extends Component {
  static childContextTypes = {
    closeToggles: PropTypes.func.isRequired
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
    if (e.target.id === 'nav-toggle' || e.target.id === 'nav-toggle-img') {
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
        blogURL = <Route exact path={`${path}page/${settings.frontPage.blog}/`} component={Posts} /> 
        blogURLPaged = <Route path={`${path}page/${settings.frontPage.blog}/p/:paged/`} component={Posts} />               
      } else {
        blogURL = null;
        blogURLPaged = null;
      }
      // Comment or uncomment according the kind of page you want to display.
      // frontPage = <Route exact path={path} render={(props) => <SinglePage slug={settings.frontPage.page} {...props} />} />;
      slideshow = <Route exact path={path} render={(props) => <Slideshow slug={settings.frontPage.page} {...props} />} />;
      frontPage = <Route exact path={path} render={(props) => <Home slug={settings.frontPage.page} {...props} />} />;
    } else {
      blogURL = <Route exact path={path} component={Posts} />
      blogURLPaged = <Route path={`${path}p/:paged/`} component={Posts} />               
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
      <ConnectedRouter
        history={history}
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
                  <svg id="search-toggle-img"><use xlinkHref="/assets/layout/lens.svg#svg-lens" /></svg>
                </button>
                <button id="nav-toggle" className={navClasses} onClick={this.toggleElements}>
                  <svg id="nav-toggle-img"><use xlinkHref="/assets/layout/hamburger.svg#hamburger" /></svg>
                </button>
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
              <Switch>
                {frontPage}{/* Guess what? The home page has custom styles... */}                             
                <div className="inner_content wrap clearfix">
                  {/* Trailing slashes for custom routes are a mess!!! */} 
                  <Switch>
                    <Route exact path={`${path}events`} component={Events} />
                    <Route exact path={`${path}events/`} component={Events} />                   
                    <Route path={`${path}events/p/:paged/`} component={Events} />   
                    <Route exact path={`${path}users`} component={Users} />             
                    <Route exact path={`${path}users/`} component={Users} />                       
                    <Route path={`${path}users/p/:paged/`} component={Users} />
                    <Route exact path={`${path}residents/:city`} render={(props) => <Users {...props} />} />
                    <Route exact path={`${path}residents/:city/`} render={(props) => <Users {...props} />} />                   
                    <Route path={`${path}residents/:city/p/:paged/`} render={(props) => <Users {...props} />} />
                    <Route exact path={`${path}alumni`} render={(props) => <Users isAlumni {...props} />} />
                    <Route exact path={`${path}alumni/`} render={(props) => <Users isAlumni {...props} />} />
                    <Route path={`${path}alumni/p/:paged/`} render={(props) => <Users isAlumni {...props} />} />
                    <Route exact path={`${path}search/:search`} component={Search} />
                    <Route exact path={`${path}search/:search/`} component={Search} />
                    <Route exact path={`${path}search/:search/p/:paged/`} component={Search} />
                    <Route exact path={`${path}category/:slug/`} render={(props) => <Term taxonomy="category" {...props} />} />
                    <Route path={`${path}category/:slug/p/:paged/`} render={(props) => <Term taxonomy="category" {...props} />} />
                    <Route exact path={`${path}tag/:slug/`} render={(props) => <Term taxonomy="post_tag" {...props} />} />
                    <Route path={`${path}tag/:slug/p/:paged/`} render={(props) => <Term taxonomy="post_tag" {...props} />} />
                    <Route exact path={`${path}date/:year/`} component={DateArchive} />
                    <Route path={`${path}date/:year/p/:paged/`} component={DateArchive} />
                    <Route exact path={`${path}date/:year/:month/`} component={DateArchive} />
                    <Route path={`${path}date/:year/:month/p/:paged/`} component={DateArchive} />
                    <Route exact path={`${path}date/:year/:month/:day/`} component={DateArchive} />
                    <Route path={`${path}date/:year/:month/:day/p/:paged/`} component={DateArchive} />
                    <Route exact path={`${path}contact/`} component={Contact} />
                    <Route exact path={`${path}page/**/`} component={SinglePage} />
                    <Route exact path={`${path}:year/:month/:day/:slug/`} component={SinglePost} />             
                    <Route exact path={`${path}events/:slug/`} component={SingleEvent} />                
                    <Route exact path={`${path}user/:slug/`} component={SingleUser} />
                    {blogURL}
                    {blogURLPaged}
                    <Route component={NotFound} />
                  </Switch>
                </div>
              </Switch>
            </div>{/* #content */}

            <div className="push" />
            <footer id="footer" className="site_footer" role="contentinfo">
              <div id="inner-footer" className="wrap clearfix">
                <a className="logo" to="#t" rel="home"><img src="/assets/layout/logo_inv.svg" alt="logo" /></a>
                <nav id="footer-navigation" role="navigation" aria-live="assertive">
                  <Navigation extended />
                </nav>
                <div className="bumper" />
                <div id="social-contacts" className="clearfix">
                  {/* <a className="social" href="https://www.facebook.com/fondazione.agire/" target="_blank" title="Facebook" rel="noopener noreferrer"><svg viewBox="0 0 512 512"><path d="M211.9 197.4h-36.7v59.9h36.7V433.1h70.5V256.5h49.2l5.2-59.1h-54.4c0 0 0-22.1 0-33.7 0-13.9 2.8-19.5 16.3-19.5 10.9 0 38.2 0 38.2 0V82.9c0 0-40.2 0-48.8 0 -52.5 0-76.1 23.1-76.1 67.3C211.9 188.8 211.9 197.4 211.9 197.4z" /></svg></a> */}
                  <a className="social" href="https://twitter.com/fondazioneagire" target="_blank" title="Twitter" rel="noopener noreferrer"><svg viewBox="0 0 512 512"><path d="M419.6 168.6c-11.7 5.2-24.2 8.7-37.4 10.2 13.4-8.1 23.8-20.8 28.6-36 -12.6 7.5-26.5 12.9-41.3 15.8 -11.9-12.6-28.8-20.6-47.5-20.6 -42 0-72.9 39.2-63.4 79.9 -54.1-2.7-102.1-28.6-134.2-68 -17 29.2-8.8 67.5 20.1 86.9 -10.7-0.3-20.7-3.3-29.5-8.1 -0.7 30.2 20.9 58.4 52.2 64.6 -9.2 2.5-19.2 3.1-29.4 1.1 8.3 25.9 32.3 44.7 60.8 45.2 -27.4 21.4-61.8 31-96.4 27 28.8 18.5 63 29.2 99.8 29.2 120.8 0 189.1-102.1 185-193.6C399.9 193.1 410.9 181.7 419.6 168.6z" /></svg></a>
                  <a className="social" href="https://www.linkedin.com/company-beta/15082552/" target="_blank" title="LinkedIn" rel="noopener noreferrer"><svg viewBox="0 0 512 512"><path d="M186.4 142.4c0 19-15.3 34.5-34.2 34.5 -18.9 0-34.2-15.4-34.2-34.5 0-19 15.3-34.5 34.2-34.5C171.1 107.9 186.4 123.4 186.4 142.4zM181.4 201.3h-57.8V388.1h57.8V201.3zM273.8 201.3h-55.4V388.1h55.4c0 0 0-69.3 0-98 0-26.3 12.1-41.9 35.2-41.9 21.3 0 31.5 15 31.5 41.9 0 26.9 0 98 0 98h57.5c0 0 0-68.2 0-118.3 0-50-28.3-74.2-68-74.2 -39.6 0-56.3 30.9-56.3 30.9v-25.2H273.8z" /></svg></a>
                </div>
                <div className="copyright">
                  <span>&copy;</span>
                  {`${new Date().getFullYear()} ${settings.meta.title}`}
                </div>
                <div className="credits">
                  Made by <a href="http://plastical.com" rel="designer noopener noreferrer" target="_blank">Plastical</a>
                </div>
              </div>
            </footer>{/* #footer */}

          </div>{/* #container */}
        </div>
      </ConnectedRouter>
    )
  }
}

Structure.propTypes = {
  onPush: PropTypes.func.isRequired,
  intl: intlShape.isRequired
}

export default injectIntl(    
  connect(mapStateToProps, mapDispatchToProps)(Structure)
);
