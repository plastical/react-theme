/* global PlasticalSettings */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import classNames from 'classnames';
import DocumentMeta from 'react-document-meta';
import ScrollIntoView from 'scroll-component';
import he from 'he';

// Internal dependencies
import BodyClass from 'utils/react-body-class';
import QueryPage from 'wordpress-query-page';
import { getPageIdFromPath, isRequestingPage, getPage } from 'wordpress-query-page/lib/selectors';
import { getTitle, getContent, getFeaturedMedia, getEditLink } from 'utils/content-mixin';

// Components
import Media from './image';
import Placeholder from 'components/placeholder';
import SubNav from 'components/navigation/sidebar';

class SinglePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasSidebar: this.props.hasSidebar,
      navItemId: this.props.navItemId
    }
  }

  renderArticle() {
    const { post, intl } = this.props;
    if (!post) {
      return null;
    }

    const meta = {
      title: `${post.title.rendered} – ${PlasticalSettings.meta.title}`,
      description: post.excerpt.rendered,
      canonical: post.link
    };
    meta.title = he.decode(meta.title);

    const classes = classNames({
      page: true
    });
    const featuredMedia = getFeaturedMedia(post);
    const editLink = getEditLink(post, intl.formatMessage({ id: 'content-mixin.edit' }));

    return (
      <article id={`post-${post.id}`} className={classes}>
        <ScrollIntoView id="#container" />          
        <DocumentMeta {...meta} />
        <BodyClass classes={['page', 'single', 'single_page']} />
        {(this.props.path.indexOf('/tecnopolo-ticino') !== -1) ?
          <h1 className="tech_title increase"><img src="/assets/layout/tecnopolo.svg" alt="logo" />{/* <strong>Tecnopolo®</strong> Ticino */}</h1> :
          <h1 className="page_title" dangerouslySetInnerHTML={getTitle(post)} />
        }
        {featuredMedia ?
          <Media media={featuredMedia} parentClass="page_image" /> :
          null
        }
        {editLink ?           
          <div className="page_meta" dangerouslySetInnerHTML={editLink} /> :
          null
        }        
        <div className="page_content" dangerouslySetInnerHTML={getContent(post, intl.formatMessage({ id: 'content-mixin.passprotected' }))} />
      </article>
    );
  }

  render() {
    /* eslint quote-props: 1 */
    const mainClasses = classNames({
      'col700': true,
      'right': this.props.hasSidebar,
      'last': this.props.hasSidebar,
      'center': !this.props.hasSidebar,
      'clearfix': true
    });

    const sidebarClasses = classNames({
      'col220': this.props.hasSidebar,
      'first': this.props.hasSidebar,
      'left': this.props.hasSidebar,
      'clearfix': true
    });

    return (
      <div className="contents">

        {(this.props.hasBack && this.props.parentNavItem) ?
          <div className="back">
            <Link className="back_link" to={this.props.parentNavItem.url} >{this.props.parentNavItem.title}</Link>
            <span className="back_current" dangerouslySetInnerHTML={getTitle(this.props.post)} />            
            <div className="lightest_sep" />
          </div> :
          null
        }

        {(this.props.hasSidebar) ?
          <aside id="sidebar" className={sidebarClasses} role="complementary">
            <SubNav filterId={this.props.navItemId} />
          </aside> :
          null
        }

        <section id="main" className={mainClasses} role="main" aria-live="assertive" tabIndex="-1">
          <QueryPage pagePath={this.props.path} />

          {this.props.loading ?
            <Placeholder type="page" /> :
            this.renderArticle()
          }
        </section>        
      </div>
    )
  }
}

export default injectIntl(
  connect((state, ownProps) => {   
    const locale = state.locale;
    let path = ownProps.slug || ownProps.location.pathname; // In case, this is the slug for the homepage

    if (path[path.length - 1] === '/') {
      path = path.slice(0, -1);
    }
    if (locale.lang !== 'en') {
      path = `${path}&lang=${locale.lang}`;
    }

    const postId = getPageIdFromPath(state, path);

    /* eslint no-undef: 1 */
    // Hacky, but it's the only way to find out if we need a sub navigation or not!
    let hasSidebar = false;
    let navItemId = 0;
    let hasBack = false;
    PlasticalMenu.data.map((item) => { 
      if (item.children.length > 0) {
        if (item.parent === 0 && item.object_id === postId) {
          navItemId = item.ID;
          hasSidebar = true;
        } 
        item.children.map((child) => {
          if (child.object_id === postId && child.parent > 0) {
            navItemId = child.parent;
            hasSidebar = true;
            hasBack = true;          
          }
        });
      }
    });
    const parentNavItem = PlasticalMenu.data.find(
      item => item.ID === navItemId
    )
        
    const requesting = isRequestingPage(state, path);
    const post = getPage(state, parseInt(postId));

    return {
      locale,
      path,
      postId,
      post,
      requesting,
      loading: requesting && !post,
      hasBack,
      parentNavItem,
      hasSidebar,
      navItemId
    };
  })(SinglePage)
);
