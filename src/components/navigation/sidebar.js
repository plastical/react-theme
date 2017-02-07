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

/* eslint quote-props: 1 */
const MenuItem = ({ item, onClick, isSelected = false }) => {
  const classes = classNames({
    'menu_item': true,
    'current_menu_item': isSelected,
    'current_menu_ancestor': false,
    'current_menu_parent': false,
  }, item.classes);

  return (
    <li className={classes}>
      <Link to={item.url} onClick={onClick}>{item.title}</Link>
    </li>
  );
}

class SubNav extends Component {  
  static contextTypes = {
    closeToggles: React.PropTypes.func.isRequired // This triggers the closing of the toggles (nav and search)
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      selected: this.props.currentPage,
      menu: this.props.menu
    }
  }

  render() { 
    const filter = this.props.menu.find(
      item => item.ID === this.props.filterId
    );

    let menu;
    if (filter) {
      menu = filter.children.map((item, i) => {
        const onClick = (e) => {
          blur(e);
          this.setState({ 
            selected: item.url
          });
          this.context.closeToggles(false);
        };
        return <MenuItem item={item} isSelected={isItemSelected(item)} onClick={onClick} key={i} />
      });
    }

    return (
      <div>
        <ul className="side_menu">
          {menu}  
        </ul>
      </div>
    );
  }
}

export default connect((state, ownProps) => {
  const filterId = ownProps.filterId;
  const path = PlasticalSettings.URL.path || '/';
  const menu = getMenu(state, `primary-${state.locale.lang}`);

  return {
    currentPage: state.selected || path,
    menu: menu || [],
    filterId: filterId || 0,
  };
})(SubNav);
