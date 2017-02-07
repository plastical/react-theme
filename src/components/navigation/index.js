/* global PlasticalSettings */
// External dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import classNames from 'classnames';
import { getMenu } from 'wordpress-query-menu/lib/selectors';
import isItemSelected from 'utils/is-item-selected';

const blur = (e) => {
  e.target.blur();
};

const toggleFocus = (e) => {
  let self = e.target;

  // Move up through the ancestors of the current link until we hit .nav_menu.
  while (self.className.indexOf('nav_menu') === -1) {
    // On li elements toggle the class .focus.
    if (self.tagName.toLowerCase() === 'li') {
      if (self.className.indexOf('focus') !== -1) {
        self.className = self.className.replace(' focus', '');
      } else {
        self.className += ' focus';
      }
    }

    self = self.parentElement;
  }
};

const SubMenu = ({ items }) => {
  const menu = items.map((item, i) => ( 
    <MenuItem item={item} isSelected={isItemSelected(item)} key={i} />
  ));

  return (
    <ul className="sub_menu">
      {menu}
    </ul>
  );
}

/* eslint quote-props: 1 */
const MenuItem = ({ item, onClick, isSelected = false, extended }) => {
  const classes = classNames({
    'menu_item': true,
    'menu_item_has_children': item.children.length,
    'current_menu_item': isSelected,
    'current_menu_ancestor': false,
    'current_menu_parent': false,
  }, item.classes);

  return (
    <li className={classes} aria-haspopup={item.children.length > 0 && extended}>
      <Link to={item.url} onClick={onClick} onFocus={toggleFocus} onBlur={toggleFocus}>{item.title}</Link>
      {item.children.length && extended ?
        <SubMenu items={item.children} /> :
        null
      }
    </li>
  );
}

class Navigation extends Component {  
  static contextTypes = {
    closeToggles: React.PropTypes.func.isRequired // This triggers the closing of the toggles (nav and search)
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      selected: this.props.currentPage
    }
  }

  render() {
    const menu = this.props.menu.map((item, i) => {
      // ext_only is a class set in the menu to hide items in the reduced version of the nav
      if (item.classes !== 'ext_only' || this.props.extended) {
        const onClick = (e) => {
          blur(e);
          this.setState({ 
            selected: item.url
          });
          this.context.closeToggles(false);
        };
        return <MenuItem item={item} isSelected={isItemSelected(item)} onClick={onClick} key={i} extended={this.props.extended} />
      }
      return null
    });

    return (
      <div className="menu">
        <ul className="nav_menu" aria-expanded="false">
          {menu}         
        </ul>
      </div>
    );
  }
}

export default connect((state, ownProps) => {
  const locale = state.locale;

  let selected = state.routing.location.pathname; 
  if (selected[selected.length - 1] === '/') {
    selected = selected.slice(0, -1);
  }
  if (locale.lang !== 'en') {
    selected = selected.replace(`/${locale.lang}/`, '');
  }  
  selected = `${PlasticalSettings.URL.base}${selected}`;

  const path = PlasticalSettings.URL.path || '/';
  const menu = getMenu(state, `primary-${state.locale.lang}`);

  return {
    currentPage: selected || path,
    menu: menu || [],
    extended: ownProps.extended || false
  };
})(Navigation);
