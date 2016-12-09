import moment from 'moment';
import find from 'lodash/find';

export default {
  getTitle(data) {
    return { __html: data.title.rendered };
  },

  // <a href=${ data.link } class="read-more">Read More <span class="screen-reader-text">${ data.title.rendered }</span></a>
  getExcerpt(data) {
    if (!data.excerpt.protected) {
      if (data.format === 'image' && !data.excerpt.rendered) {
        return { __html: data.content.rendered };
      }
      return { __html: data.excerpt.rendered };
    }

    return { __html: '<p>This content is password-protected.</p>' };
  },

  getContent(data) {
    if (!data.content.protected) {
      return { __html: data.content.rendered };
    }

    return { __html: '<p>This content is password-protected.</p>' };
  },

  getDate(data) {
    const date = moment(data.date);
    return date.format('MMMM Do YYYY');
  },

  getTime(data) {
    const date = moment(data.date);
    return date.format('h:mm a');
  },
  /* eslint no-underscore-dangle: 1 */
  getFeaturedMedia(data) {
    if (!data._embedded) {
      return false;
    }
    if (typeof data._embedded['wp:featuredmedia'] === 'undefined') {
      return false;
    }
    const media = find(data._embedded['wp:featuredmedia'], item => (typeof item.source_url !== 'undefined'));
    return media;
  }
};
