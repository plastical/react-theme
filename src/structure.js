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
    const languageSwitch = (locale.lang === 'it') ? '/en/' : '/';

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
          <div id="container" className="site">
            <a id="t" href="#content" className="skip_link screen_reader_text">{intl.formatMessage({ id: 'structure.skip' })}</a>
            <header id="header" className="site_header" role="banner">
              <div id="inner-header" className="wrap clearfix">
                {/* 
                Remember to remove the comment brackets when going multilingual
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
                </button> */}            
                <button id="search-toggle" className={searchClasses} onClick={this.toggleElements}>
                  <svg id="search-toggle-img" ><use xlinkHref="/assets/layout/lens.svg#svg-lens" /></svg>
                </button>
                <button id="nav-toggle" className={navClasses} onClick={this.toggleElements}>
                  <svg id="nav-toggle-img" ><use xlinkHref="/assets/layout/hamburger.svg#hamburger" /></svg>
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
            {slideshow}
            <div id="content" className="site_content">
              <Switch>
                {frontPage}{/* Guess what? The home page has custom styles... */}                             
                <div className="inner_content wrap clearfix">
                  {/* Trailing slashes for custom routes are a mess!!! */} 
                  <Switch>
                    <Route exact path={`${path}events`} component={Events} />
                    <Route exact path={`${path}events/`} component={Events} />                   
                    <Route path={`${path}events/p/:paged/`} component={Events} />
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
                    {blogURL}
                    {blogURLPaged}
                    <Route component={NotFound} />
                  </Switch>
                </div>                
              </Switch>
              <div className="light_sep wrap clearfix" />
            </div>{/* #content */}
            <div className="push" />
          </div>{/* #container */}
            
          <footer id="footer" className="site_footer" role="contentinfo">
            <div id="inner-footer" className="wrap clearfix">
              {/* <nav id="footer-navigation" role="navigation" aria-live="assertive">
                <Navigation extended />
              </nav> */}
              <div className="bumper" />
              <div id="social-contacts" className="clearfix">
                <a className="social" href="https://www.facebook.com/promoecochiasso/" target="_blank" title="Facebook" rel="noopener noreferrer"><svg viewBox="0 0 512 512"><path d="M211.9 197.4h-36.7v59.9h36.7V433.1h70.5V256.5h49.2l5.2-59.1h-54.4c0 0 0-22.1 0-33.7 0-13.9 2.8-19.5 16.3-19.5 10.9 0 38.2 0 38.2 0V82.9c0 0-40.2 0-48.8 0 -52.5 0-76.1 23.1-76.1 67.3C211.9 188.8 211.9 197.4 211.9 197.4z" /></svg></a>                  
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
