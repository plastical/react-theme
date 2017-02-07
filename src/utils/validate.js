export default {
  validateName(value) {    
    if (value !== '' && value.match(/^([A-Z|a-z|À-ÿ|0-9]{2,}\s?)+(([A-Za-zÀ-ÿ0-9]\s?)+)*$/)) {
      return false;
    }
    return true;
  },

  validateEmail(value) { // Brutally simple, but it's ok. Never trust the client!
    if (value !== '' && value.match(/^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,7})+$/)) {
      return false;
    }
    return true;
  },

  /* eslint no-irregular-whitespace: 1 */
  validateURL(value) {
    if (value === '' || value.match(/^$|^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.‌​\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[‌​6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1‌​,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00‌​a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u‌​00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/)) {
      return false;
    }
    return true;
  },

  validateNoHTML(value) {
    if (value === '' || value.match(/^[^< ]*[^>]*$/)) {
      return false;
    }
    return true;
  },

  validateNoWeirdChrs(value) {
    if (value === '' || value.match(/^([a-zA-Z0-9 _-]+)$/)) {
      return false;
    }
    return true;
  },


  validateMinLength(value, length) {
    if (value.length >= length) {
      return false;
    }
    return true;
  },

  validateIsEmpty(value) {
    if (value.length === 0) {
      return false
    }
    return true;
  },

  verifyString() {
    let text = '';
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let varLength = Math.floor(Math.random() * 12);
    if (varLength < 5) {
      varLength = 5;
    }

    for (let i = 0; i < varLength; i += 1) {
      text += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }

    return text;
  }
}
