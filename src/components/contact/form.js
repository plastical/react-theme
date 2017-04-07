/* eslint no-param-reassign: 1 */
/* eslint no-undef: 1 */
/* global PlasticalSettings */
// External dependencies
import React, { Component } from 'react';

// Internal dependencies
import validate from 'utils/validate';

const now = new Date(Date.now());

class ContactForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      built: now.toISOString(),
      file_input: '',
      verify: validate.verifyString(),
      language: this.props.locale.lang,
      error_name: false,
      error_email: false,
      error_company: false,
      error_url: false,
      error_details: false,
      error_file_input: false,
      error_verify: false,
      errors: false,
      errorMessage: false,
      successMessage: false
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFile = this.handleFile.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleErrors = this.handleErrors.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onBlur(e) {    
    this.validation(e);
  }

  onKeyPress(e) {
    this.validation(e);
  }

  onSubmit(e) {
    e.preventDefault();
    e.persist(); // We need this for the callback after a message is posted.
    this.validation(e);  
    // this.setState({ isSubmitting: true });

    const keys = ['name', 'email', 'company', 'industry', 'url', 'reason', 'details', 'file_input', 'verify', 'built', 'language'];
       
    const rawValues = {};
    keys.map((key) => {
      if (e.target[key]) {
        rawValues[key] = e.target[key].value.trim();
      }
    });

    const values = {}; 
    values.name = rawValues.name;
    values.email = rawValues.email;
    values.company = rawValues.company;
    values.industry = rawValues.industry;
    values.url = rawValues.url;
    values.reason = rawValues.reason;    
    values.details = rawValues.details; 
    const fileInput = e.target.file_input.files[0];
    values.verify = rawValues.verify;
    values.built = rawValues.built;
    values.language = rawValues.language;
    values.submit = true;   

    if (this.state.errors) {
      this.handleErrors();
    } else {
      const submission = this.handleSubmit(values, fileInput);
      submission.then((res) => {
        // No idea what happened.
        if (!res) {
          return;
        }
        this.setState({ 
          isSubmitting: false,
          file_input: '',
          built: now.toISOString(),
          verify: validate.verifyString(),  
        });
        if (res.result === 'ok') {
          // Clear the details form
          e.target.name.value = '';
          e.target.email.value = '';
          e.target.company.value = '';
          e.target.url.value = '';
          e.target.details.value = '';
          e.target.file_input.value = '';
          e.target.submit.value = false;        
          this.setState({       
            successMessage: `${this.props.intl.formatMessage({ id: 'contact.success_message' })}, ${res.name}` 
          });
        } else {   
          this.handleErrors();
        }
              
        if (res.result === 'ko') {
          this.handleErrors();
        }
      });
    }
  }

  validation(e) {
    if (e.target.name === 'name') {      
      this.setState({ error_name: validate.validateName(e.target.value) });
    } 
    if (e.target.name === 'email') {
      this.setState({ error_email: validate.validateEmail(e.target.value) });
    }
    if (e.target.name === 'company') {      
      this.setState({ error_industry: validate.validateMinLength(e.target.value, 3) || validate.validateNoHTML(e.target.value) });
    } 
    if (e.target.name === 'url') {
      this.setState({ error_url: validate.validateURL(e.target.value) });
    }
    if (e.target.name === 'details') {
      this.setState({ error_details: validate.validateMinLength(e.target.value, 100) || validate.validateNoHTML(e.target.value) });
    }
    if (e.target.name === 'file_input') {
      this.setState({ error_file_input: validate.validatePDF(e.target.value, e.target.files[0], (10485760 / 5)) });
    }
    if (e.target.name === 'verify') {
      this.setState({ error_verify: validate.validateIsEmpty(e.target.value) });
    }
    if (
      this.state.error_name || 
      this.state.error_email || 
      this.state.error_company || 
      this.state.error_url ||
      this.state.error_details ||
      this.state.error_file_input ||
      this.state.error_verify
    ) {
      this.setState({ errors: true });
    } else {
      this.setState({ errors: false });
    }
  }

  handleErrors() {
    this.setState({ errorMessage: this.props.intl.formatMessage({ id: 'contact.error_message' }) });
    setTimeout(() => {
      this.setState({ errorMessage: false });
    }, 5000);
  }

  // Helper to submit the comment with nonce header
  handleSubmit(values, fileInput) {
    const url = `${SiteSettings.endpoint}content/themes/plastical/contact/contact-proc.php`;
    const headers = {
      Accept: 'application/json',
      'X-WP-Nonce': SiteSettings.nonce,
      // 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      'Content-Type': 'application/json',
    }; 
    
    const data = new FormData();
    data.append('file_input', fileInput);
    data.append('name', values.name);
    data.append('email', values.email);
    data.append('company', values.company);
    data.append('industry', values.industry);
    data.append('url', values.url);
    data.append('reason', values.reason);    
    data.append('details', values.details); 
    data.append('verify', values.verify);
    data.append('built', values.built);
    data.append('language', values.language);
    data.append('submit', values.submit);  
     
    /* eslint arrow-body-style: 1 */
    return fetch(url, {
      method: 'POST',
      // headers,
      // credentials: 'same-origin',
      // body: JSON.stringify(values)
      body: data
    }).then(response => {   
      return response.text();
    }).then(result => {  
      let json;
      try {
        json = JSON.parse(result);
      } catch (e) {
        /* eslint no-throw-literal: 1 */
        throw { message: text, code: response.status };
      }
      return json;
    });
  }

  handleFile(e) {
    this.setState({ file_input: e.target.value });
  }

  handleChange(e) {
    this.setState({ verify: e.target.value });
  }
  
  render() {
    const intl = this.props.intl;
    const successMessage = this.state.successMessage ? <div className="success">{this.state.successMessage}</div> : null;
    const errorMessage = this.state.errorMessage ? <div className="error">{this.state.errorMessage}</div> : null;
    return (
      <form onSubmit={this.onSubmit} encType="multipart/form-data">
        {successMessage}
        {errorMessage}

        <div className="contact_form_field">
          <label htmlFor="name">{intl.formatMessage({ id: 'contact.name' })} *</label>
          <input id="name" className={(this.state.error_name) ? 'error' : ''} name="name" type="text" onBlur={this.onBlur} onKeyPress={this.onKeyPress} aria-required="true" required="required" placeholder={intl.formatMessage({ id: 'contact.name_ph' })} />
          {(this.state.error_name) ? <span className="error_message">{intl.formatMessage({ id: 'contact.name_err' })}</span> : null}
        </div>
        <div className="contact_form_field">
          <label htmlFor="email">Email *</label>
          <input id="email" className={(this.state.error_email) ? 'error' : ''} name="email" type="email" onBlur={this.onBlur} onKeyPress={this.onKeyPress} aria-describedby="email-notes" aria-required="true" required="required" placeholder={intl.formatMessage({ id: 'contact.email_ph' })} />
          {(this.state.error_email) ? <span className="error_message">{intl.formatMessage({ id: 'contact.email_err' })}</span> : null}
        </div>
        <div className="contact_form_field">
          <label htmlFor="company">{intl.formatMessage({ id: 'contact.company' })}</label>
          <input id="company" className={(this.state.error_company) ? 'error' : ''} name="company" type="text" onBlur={this.onBlur} onKeyPress={this.onKeyPress} placeholder={intl.formatMessage({ id: 'contact.company_ph' })} />
          {(this.state.error_company) ? <span className="error_message">{intl.formatMessage({ id: 'contact.company_err' })}</span> : null}
        </div>
        <div className="contact_form_field">
          <label htmlFor="url">{intl.formatMessage({ id: 'contact.project_url' })}</label>
          <input id="url" className={(this.state.error_url) ? 'error' : ''} name="url" type="text" onBlur={this.onBlur} onKeyPress={this.onKeyPress} placeholder={intl.formatMessage({ id: 'contact.project_url_ph' })} />
          {(this.state.error_url) ? <span className="error_message">{intl.formatMessage({ id: 'contact.project_url_err' })}</span> : null}
        </div>
        <div className="contact_form_field">
          <label htmlFor="industry">{intl.formatMessage({ id: 'contact.industry' })} *</label>
          <select name="industry">
            <option value="life-sciences">{intl.formatMessage({ id: 'contact.life-sciences' })}</option>
            <option value="digital-ict">{intl.formatMessage({ id: 'contact.digital-ict' })}</option>
            <option value="hightech-industrial">{intl.formatMessage({ id: 'contact.hightech-industrial' })}</option>
            <option value="cleantech-energy">{intl.formatMessage({ id: 'contact.cleantech-energy' })}</option>
            <option value="fashion">{intl.formatMessage({ id: 'contact.fashion' })}</option>
            <option value="other">{intl.formatMessage({ id: 'contact.other' })}</option>
          </select>
        </div>
        <div className="contact_form_field">
          <label htmlFor="reason">{intl.formatMessage({ id: 'contact.reason' })} *</label>
          <select name="reason">
            <option value="tech-transfer_startup-support">{intl.formatMessage({ id: 'contact.tech_transfer-support' })}</option>
            <option value="tecnopolo">{intl.formatMessage({ id: 'contact.tecnopolo' })}</option>
            <option value="other">{intl.formatMessage({ id: 'contact.other' })}</option>
          </select>
        </div>        
        <div className="contact_form_field">
          <label htmlFor="details">{intl.formatMessage({ id: 'contact.details' })} *</label>
          <textarea 
            id="details"
            className={(this.state.error_details) ? 'error' : ''} 
            name="details" 
            onBlur={this.onBlur}
            onKeyPress={this.onKeyPress} 
            rows="12"
            aria-required="true" 
            required="required" 
            placeholder={intl.formatMessage({ id: 'contact.details_ph' })} 
          />
          {(this.state.error_details) ? <span className="error_message">{intl.formatMessage({ id: 'contact.details_err' })} </span> : null}
        </div>

        <div className="contact_form_field">
          <label htmlFor="file_input">{intl.formatMessage({ id: 'contact.file' })} <span>{intl.formatMessage({ id: 'contact.file_span' })}</span></label>
          <input id="file-input" className={(this.state.error_file_input) ? 'error col620 first left clearfix' : 'col620 first left clearfix'} name="file_input" type="file" onBlur={this.onBlur} onChange={this.handleFile} value={this.state.file_input} />
          {(this.state.error_file_input) ? <span className="error_message">{intl.formatMessage({ id: 'contact.file_err' })} </span> : null}                
        </div>
        <div style={{ clear: 'both' }} />
        <div className="contact_form_field">
          <label htmlFor="verify">{intl.formatMessage({ id: 'contact.verification' })} <span>{intl.formatMessage({ id: 'contact.verification_span' })}</span></label>
          <input id="verify" className={(this.state.error_verify) ? 'error col620 first left clearfix' : 'col620 first left clearfix'} name="verify" type="text" onBlur={this.onBlur} onKeyPress={this.onKeyPress} onChange={this.handleChange} value={this.state.verify} />
          {(this.state.error_verify) ? <span className="error_message">{intl.formatMessage({ id: 'contact.verification_err' })}</span> : null}
        </div>

        <div className="contact_form_submit">
          {(this.state.isSubmitting) ?
            <div>...</div> :  
            <input id="submit" type="submit" name="submit" className="submit col620 first left clearfix" value={intl.formatMessage({ id: 'contact.send' })} />
          }
          <input id="built" type="hidden" name="built" value={this.state.built} />
          <input id="language" type="hidden" name="language" value={this.state.language} />
          <div className="bumper" />
          <p>* {intl.formatMessage({ id: 'contact.mandatory_fields' })}</p>
        </div>
      </form>
    );
  }
}

export default ContactForm;
