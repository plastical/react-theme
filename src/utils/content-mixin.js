import moment from 'moment';
import find from 'lodash/find';

export default {
  getTitle(data) {
    return { __html: data.title.rendered };
  },

  // <a href=${ data.link } class="read-more">Read More <span class="screen-reader-text">${ data.title.rendered }</span></a>
  getExcerpt(data, message) {
    if (!data.excerpt.protected) {
      if (data.format === 'image' && !data.excerpt.rendered) {
        return { __html: data.content.rendered };
      }
      return { __html: data.excerpt.rendered };
    }

    return { __html: `<p>${message}.</p>` };
  },

  getContent(data, message) {
    if (!data.content.protected) {
      return { __html: data.content.rendered };
    }

    return { __html: `<p>${message}.</p>` };
  },

  getDate(date) {
    const dateToFormat = moment(date);
    return dateToFormat.format('DD.MM.YYYY');
  },

  getTime(date) {
    const dateToFormat = moment(date);
    return dateToFormat.format('HH:mm');
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
  },

  getCapitalize(str) {
    return str.replace(/(^|\s)([a-z])/g, (m, p1, p2) => (p1 + p2.toUpperCase()))
  },

  getEditLink(data, message) {
    /* eslint no-undef: 0 */
    if (PlasticalSettings.canEdit) {
      return { __html: `<a href="/wp-admin/post.php?post=${data.id}&action=edit&lang=${PlasticalSettings.lang}">${message}</a>` };
    }
    return { __html: '' };
  }
};
