/* eslint prefer-template: 1 */
/* global PlasticalSettings */
// External dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { getMenu } from 'wordpress-query-menu/lib/selectors';

const isItemSelected = (item) => {
  let reg;
  if (location.pathname !== '/') {
    reg = new RegExp(location.pathname + '$');
  } else {
    reg = new RegExp(location.hostname + '/$');
  }
  return (location.pathname === item.url) || reg.test(item.url);
};

const blur = (e) => {
  e.target.blur();
};

const toggleFocus = (e) => {
  let self = e.target;

  // Move up through the ancestors of the current link until we hit .nav-menu.
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
const MenuItem = ({ item, onClick, isSelected = false }) => {
  const classes = classNames({
    'menu_item': true,
    'menu_item_has_children': item.children.length,
    'current_menu_item': isSelected,
    'current_menu_ancestor': false,
    'current_menu_parent': false,
  }, item.classes);

  return (
    <li className={classes} aria-haspopup={item.children.length > 0}>
      <a href={item.url} onClick={onClick} onFocus={toggleFocus} onBlur={toggleFocus}>{item.title}</a>
      { item.children.length ?
        <SubMenu items={item.children} /> :
        null
      }
    </li>
  );
}

class Navigation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMenuOpen: false,
      selected: this.props.currentPage
    }
  }

  toggleMenu(e) {
    e.preventDefault();
    this.setState({ 
      isMenuOpen: !this.state.isMenuOpen 
    });
  }

  render() {
    const menu = this.props.menu.map((item, i) => {
      const onClick = (event) => {
        blur(event);
        this.setState({ 
          selected: item.url
        });
      };
      return <MenuItem item={item} isSelected={isItemSelected(item)} onClick={onClick} key={i} />
    });

    const menuClasses = classNames({
      'menu_container': true,
      'menu_open': this.state.isMenuOpen
    });

    return (
      <div className={menuClasses}>
        <div className="menu_toggle">
          <button onClick={this.toggleMenu}>Menu</button>
        </div>
        <ul className="menu nav_menu" aria-expanded="false">
          {menu}
        </ul>
      </div>
    );
  }
}

export default connect((state) => {
  const path = PlasticalSettings.URL.path || '/';
  const menu = getMenu(state, 'primary');
  return {
    currentPage: state.routing.locationBeforeTransitions.pathname || path,
    menu: menu || [],
  };
})(Navigation);
