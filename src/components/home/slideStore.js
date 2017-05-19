function SlideStore(initialState = { currentSlide: 0 }) {
  this.state = initialState;
}

SlideStore.prototype.mergeState = function (partialState) {
  Object.assign(this.state, partialState);
}

SlideStore.prototype.getState = function () {
  return this.state;
}
/* eslint import/prefer-default-export: 0 */
export const slideStore = new SlideStore();
