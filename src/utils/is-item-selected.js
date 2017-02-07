/* eslint prefer-template: 1 */

const isItemSelected = (item) => {
  let reg;
  if (location.pathname !== '/') {
    reg = new RegExp(location.pathname + '$');
  } else {
    reg = new RegExp(location.hostname + '/$');
  }
  return (location.pathname === item.url) || reg.test(item.url);
};

export default isItemSelected;
