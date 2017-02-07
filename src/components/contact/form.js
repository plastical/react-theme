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
      displayForm: 'info',
      built: now.toISOString(),
      verify: validate.verifyString(),
      language: this.props.locale.lang,
      error_name: false,
      error_email: false,
      error_project_name: false,
      error_industry: false,
      error_founded: false,
      error_funds_raised: false,
      error_url: false,
      error_details: false,
      error_verify: false,
      errors: false,
      errorMessage: false,
      successMessage: false
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleErrors = this.handleErrors.bind(this);
    this.toggleForm = this.toggleForm.bind(this);
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
    this.setState({ isSubmitting: true });

    const keys = ['name', 'email', 'reason', 'project_name', 'need', 'industry', 'founded', 'funds_raised', 'url', 'details', 'verify', 'built', 'language'];
    
    const rawValues = {};
    keys.map((key) => {
      if (e.target[key]) {
        rawValues[key] = e.target[key].value.trim();
      }
    });

    const values = {}; 
    values.name = rawValues.name;
    values.email = rawValues.email;
    values.reason = rawValues.reason;
    if (rawValues.reason === 'project') {
      values.project_name = rawValues.project_name;
      values.need = rawValues.need;
      values.industry = rawValues.industry;
      values.founded = rawValues.founded;
      values.funds_raised = rawValues.funds_raised;
      values.url = rawValues.url;
    }
    values.details = rawValues.details;
    values.verify = rawValues.verify;
    values.built = rawValues.built;
    values.language = rawValues.language;
    values.submit = true;   

    if (this.state.errors) {
      this.handleErrors();
    } else {
      const submission = this.handleSubmit(values);
      submission.then((res) => {
        // No idea what happened.
        if (!res) {
          return;
        }
        this.setState({ 
          isSubmitting: false,
          built: now.toISOString(),
          verify: validate.verifyString(),  
        });
        if (res.result === 'ok') {
          // Clear the details form
          e.target.name.value = '';
          e.target.email.value = '';
          if (rawValues.reason === 'project') {
            e.target.project_name.value = '';
            e.target.need.value = '';
            e.target.industry.value = '';
            e.target.founded.value = '';
            e.target.funds_raised.value = '';
          }
          e.target.details.value = '';
          e.target.submit.value = false;        
          this.setState({       
            displayForm: 'info',  
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
    if (e.target.name === 'project_name') {
      this.setState({ error_project_name: validate.validateMinLength(e.target.value, 3) || validate.validateNoHTML(e.target.value) });
    }
    if (e.target.name === 'industry') {
      this.setState({ error_industry: validate.validateMinLength(e.target.value, 3) || validate.validateNoHTML(e.target.value) });
    }
    if (e.target.name === 'founded') {
      this.setState({ error_founded: validate.validateNoHTML(e.target.value) });
    }
    if (e.target.name === 'funds_raised') {
      this.setState({ error_funds_raised: validate.validateNoHTML(e.target.value) });
    }
    if (e.target.name === 'url') {
      this.setState({ error_url: validate.validateURL(e.target.value) });
    }
    if (e.target.name === 'details') {
      this.setState({ error_details: validate.validateMinLength(e.target.value, 100) || validate.validateNoHTML(e.target.value) });
    }
    if (e.target.name === 'verify') {
      this.setState({ error_verify: validate.validateIsEmpty(e.target.value) });
    }
    if (
      this.state.error_name || 
      this.state.error_email || 
      this.state.error_project_name ||
      this.state.error_industry ||
      this.state.error_founded ||
      this.state.error_funds_raised ||
      this.state.error_url ||
      this.state.error_details ||
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
  handleSubmit(values) {
    const url = `${SiteSettings.endpoint}content/themes/plastical/contact/contact-proc.php`;
    const headers = {
      Accept: 'application/json',
      'X-WP-Nonce': SiteSettings.nonce,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    };
    /* eslint arrow-body-style: 1 */
    return fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(values)
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

  handleChange(e) {
    this.setState({ verify: e.target.value });
  }

  toggleForm(e) {
    if (e.target.value === 'info') {
      this.setState({ 
        displayForm: 'info'
      })
    }
    if (e.target.value === 'project') {    
      this.setState({ 
        displayForm: 'project'
      });
    }
  }

  renderProject() {
    const intl = this.props.intl;
    return (
      <div>
        <div className="contact_form_field">
          <label htmlFor="project_name">{intl.formatMessage({ id: 'contact.project_name' })} *</label>
          <input id="project-name" className={(this.state.error_project_name) ? 'error' : ''} name="project_name" type="text" aria-required="true" required="required" onBlur={this.onBlur} onKeyPress={this.onKeyPress} placeholder={intl.formatMessage({ id: 'contact.project_name_ph' })} />
          {(this.state.error_project_name) ? <span className="error_message">{intl.formatMessage({ id: 'contact.project_name_err' })}</span> : null}
        </div>
        <div className="contact_form_field">
          <label htmlFor="need">{intl.formatMessage({ id: 'contact.support_needed' })} *</label>
          <select name="need" readOnly>
            <option value="networking">{intl.formatMessage({ id: 'contact.networking' })}</option>
            <option value="tech-transfer">{intl.formatMessage({ id: 'contact.tech_transfer' })}</option>
            <option value="headquarters">{intl.formatMessage({ id: 'contact.headquarters' })}</option>
            <option value="growth">{intl.formatMessage({ id: 'contact.growth' })}</option>
            <option value="coaching">{intl.formatMessage({ id: 'contact.coaching' })}</option>
            <option value="other">{intl.formatMessage({ id: 'contact.other' })}</option>
          </select>
        </div>
        <div className="contact_form_field">
          <label htmlFor="industry">{intl.formatMessage({ id: 'contact.industry' })} *</label>
          <input id="industry" className={(this.state.error_industry) ? 'error' : ''} name="industry" type="text" aria-required="true" required="required" onBlur={this.onBlur} onKeyPress={this.onKeyPress} placeholder={intl.formatMessage({ id: 'contact.industry_ph' })} />
          {(this.state.error_industry) ? <span className="error_message">{intl.formatMessage({ id: 'contact.industry_err' })}</span> : null}
        </div>
        <div className="contact_form_field">
          <label htmlFor="founded">{intl.formatMessage({ id: 'contact.founded' })}</label>
          <input id="founded" className={(this.state.error_founded) ? 'error' : ''} name="founded" type="text" onBlur={this.onBlur} onKeyPress={this.onKeyPress} placeholder={intl.formatMessage({ id: 'contact.founded_ph' })} />
          {(this.state.error_founded) ? <span className="error_message">{intl.formatMessage({ id: 'contact.founded_err' })}</span> : null}
        </div>
        <div className="contact_form_field">
          <label htmlFor="funds_raised">{intl.formatMessage({ id: 'contact.funds_raised' })}</label>
          <input id="funds-raised" className={(this.state.error_funds_raised) ? 'error' : ''} name="funds_raised" type="text" onBlur={this.onBlur} onKeyPress={this.onKeyPress} placeholder={intl.formatMessage({ id: 'contact.funds_raised_ph' })} />
          {(this.state.error_funds_raised) ? <span className="error_message">{intl.formatMessage({ id: 'contact.funds_raised_err' })}</span> : null}
        </div>
        <div className="contact_form_field">
          <label htmlFor="url">{intl.formatMessage({ id: 'contact.project_url' })}</label>
          <input id="url" className={(this.state.error_url) ? 'error' : ''} name="url" type="text" onBlur={this.onBlur} onKeyPress={this.onKeyPress} placeholder={intl.formatMessage({ id: 'contact.project_url_ph' })} />
          {(this.state.error_url) ? <span className="error_message">{intl.formatMessage({ id: 'contact.project_url_err' })}</span> : null}
        </div>
      </div>
    );
  }

  render() {
    const intl = this.props.intl;
    const successMessage = this.state.successMessage ? <div className="success">{this.state.successMessage}</div> : null;
    const errorMessage = this.state.errorMessage ? <div className="error">{this.state.errorMessage}</div> : null;
    return (
      <form onSubmit={this.onSubmit}>
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
          <label htmlFor="reason">{intl.formatMessage({ id: 'contact.reason' })} *</label>
          <select name="reason" onChange={this.toggleForm}>
            <option value="info">{intl.formatMessage({ id: 'contact.info_request' })}</option>
            <option value="project">{intl.formatMessage({ id: 'contact.project_submission' })}</option>
          </select>
        </div>

        {(this.state.displayForm === 'project') ? this.renderProject() : null}
        
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
