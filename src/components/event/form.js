/* eslint no-param-reassign: 1 */
/* eslint no-undef: 1 */
/* global PlasticalSettings */
// External dependencies
import React, { Component } from 'react';

// Internal dependencies
import validate from 'utils/validate';
import { getDate, getTime } from 'utils/content-mixin';

const now = new Date(Date.now());
const d = new Date();
const milli = d.valueOf();

class EventForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deadline: this.props.deadline,
      deadline_comp: this.props.deadlineComp,
      reason: 'attendance',
      built: now.toISOString(),
      verify: validate.verifyString(),
      language: this.props.locale.lang,
      post_id: this.props.postId,
      event_name: this.props.name,
      event_startdate: this.props.startdate,
      error_first_name: false,
      error_last_name: false,
      error_email: false,
      error_company: false,
      error_address: false,
      error_verify: false,
      errors: false,
      errorMessage: false,
      successMessage: false
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleErrors = this.handleErrors.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onKeyPress(e) {
    this.validation(e);
  }

  onBlur(e) {    
    this.validation(e);
  }

  onSubmit(e) {
    e.preventDefault();
    e.persist(); // We need this for the callback after a registration is posted.
    this.validation(e);  
    this.setState({ isSubmitting: true });

    const keys = ['post_id', 'ticket_type', 'reason', 'first_name', 'last_name', 'email', 'company', 'address', 'verify', 'built', 'language', 'event_name', 'event_startdate'];
    
    const rawValues = {};
    keys.map((key) => {
      if (e.target[key]) {
        rawValues[key] = e.target[key].value.trim();
      }
    });

    const values = {}; 
    values.post_id = rawValues.post_id;
    values.ticket_type = rawValues.ticket_type;
    values.reason = rawValues.reason;
    values.first_name = rawValues.first_name;
    values.last_name = rawValues.last_name;
    values.email = rawValues.email;
    values.company = rawValues.company;
    values.address = rawValues.address;
    values.verify = rawValues.verify;
    values.built = rawValues.built;
    values.language = rawValues.language;
    values.event_name = rawValues.event_name;
    values.event_startdate = rawValues.event_startdate;
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
          deadline: this.props.deadline,
          reason: 'attendance',
          built: now.toISOString(),
          verify: validate.verifyString(),
          language: this.props.locale.lang,
          post_id: this.props.postId,
          event_name: this.props.name,
          event_startdate: this.props.startdate,
        });
        if (res.result === 'ok') {
          // Clear the details form
          e.target.first_name.value = '';
          e.target.last_name.value = '';
          e.target.email.value = '';
          e.target.company.value = '';
          e.target.address.value = '';
          e.target.submit.value = false;        
          this.setState({ 
            successMessage: `${this.props.intl.formatMessage({ id: 'event.success_message' })}, ${res.name}` 
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
    if (e.target.name === 'first_name') {      
      this.setState({ error_first_name: validate.validateName(e.target.value) });
    }
    if (e.target.name === 'last_name') {      
      this.setState({ error_last_name: validate.validateName(e.target.value) });
    } 
    if (e.target.name === 'email') {
      this.setState({ error_email: validate.validateEmail(e.target.value) });
    }
    if (e.target.name === 'company') {
      this.setState({ error_company: validate.validateNoHTML(e.target.value) });
    }
    if (e.target.name === 'address') {
      this.setState({ error_address: validate.validateMinLength(e.target.value, 3) || validate.validateNoHTML(e.target.value) });
    }
    if (e.target.name === 'verify') {
      this.setState({ error_verify: validate.validateIsEmpty(e.target.value) });
    }
    if (
      this.state.error_first_name || 
      this.state.error_last_name || 
      this.state.error_email || 
      this.state.error_company ||
      this.state.error_address ||
      this.state.error_verify
    ) {
      this.setState({ errors: true });
    } else {
      this.setState({ errors: false });
    }
  }

  handleErrors() {
    this.setState({ errorMessage: this.props.intl.formatMessage({ id: 'event.error_message' }) });
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

  renderForm() {  
    const intl = this.props.intl;
    const successMessage = this.state.successMessage ? <div className="success">{this.state.successMessage}</div> : null;
    const errorMessage = this.state.errorMessage ? <div className="error">{this.state.errorMessage}</div> : null;
    return (      
      <div className="registration_form">
        <p>{intl.formatMessage({ id: 'event.deadline' })} {this.state.deadline}</p>
        <form onSubmit={this.onSubmit}>
          {successMessage}
          {errorMessage}

          <div className="contact_form_field">
            <label htmlFor="ticket_type">{intl.formatMessage({ id: 'event.attending_as' })} *</label>
            <select name="ticket_type" readOnly>
              <option value="startup">Startup</option>
              <option value="investor">{intl.formatMessage({ id: 'event.investor' })}</option>
              <option value="partner">Partner</option>
              <option value="guest">{intl.formatMessage({ id: 'event.guest' })}</option>
            </select>
          </div>
          <div className="contact_form_field">
            <label htmlFor="first_name">{intl.formatMessage({ id: 'event.first_name' })} *</label>
            <input id="first-name" className={(this.state.error_first_name) ? 'error' : ''} name="first_name" type="text" onBlur={this.onBlur} onKeyPress={this.onKeyPress} aria-required="true" required="required" placeholder={intl.formatMessage({ id: 'event.first_name_ph' })} />
            {(this.state.error_first_name) ? <span className="error_message">{intl.formatMessage({ id: 'event.first_name_err' })}</span> : null}
          </div>
          <div className="contact_form_field">
            <label htmlFor="last_name">{intl.formatMessage({ id: 'event.last_name' })} *</label>
            <input id="last-name" className={(this.state.error_last_name) ? 'error' : ''} name="last_name" type="text" onBlur={this.onBlur} onKeyPress={this.onKeyPress} aria-required="true" required="required" placeholder={intl.formatMessage({ id: 'event.last_name_ph' })} />
            {(this.state.error_last_name) ? <span className="error_message">{intl.formatMessage({ id: 'event.last_name_err' })}</span> : null}
          </div>
          <div className="contact_form_field">
            <label htmlFor="email">Email *</label>
            <input id="email" className={(this.state.error_email) ? 'error' : ''} name="email" type="email" onBlur={this.onBlur} onKeyPress={this.onKeyPress} aria-describedby="email-notes" aria-required="true" required="required" placeholder={intl.formatMessage({ id: 'contact.email_ph' })} />
            {(this.state.error_email) ? <span className="error_message">{intl.formatMessage({ id: 'contact.email_err' })}</span> : null}
          </div>
          <div className="contact_form_field">
            <label htmlFor="company">{intl.formatMessage({ id: 'event.company' })}</label>
            <input id="company" className={(this.state.error_company) ? 'error' : ''} name="company" type="text" onBlur={this.onBlur} onKeyPress={this.onKeyPress} placeholder={intl.formatMessage({ id: 'event.company_ph' })} />
            {(this.state.error_company) ? <span className="error_message">{intl.formatMessage({ id: 'event.company_err' })}</span> : null}
          </div>
          <div className="contact_form_field">
            <label htmlFor="address">{intl.formatMessage({ id: 'event.address' })} *</label>
            <input id="address" className={(this.state.error_address) ? 'error' : ''} name="address" type="address" onBlur={this.onBlur} onKeyPress={this.onKeyPress} aria-required="true" required="required" placeholder={intl.formatMessage({ id: 'event.address_ph' })} />
            {(this.state.error_address) ? <span className="error_message">{intl.formatMessage({ id: 'event.address_err' })}</span> : null}
          </div>
          <div className="contact_form_field">
            <label htmlFor="verify">{intl.formatMessage({ id: 'contact.verification' })} <span>{intl.formatMessage({ id: 'contact.verification_span' })}</span></label>
            <input id="verify" className={(this.state.error_verify) ? 'error col620 first left clearfix' : 'col620 first left clearfix'} name="verify" type="text" onBlur={this.onBlur} onKeyPress={this.onKeyPress} onChange={this.handleChange} value={this.state.verify} />
            {(this.state.error_verify) ? <span className="error_message">{intl.formatMessage({ id: 'contact.verification_err' })}</span> : null}
          </div>

          <div className="contact_form_submit">
            {(this.state.isSubmitting) ?
              <div>...</div> :  
              <input id="submit" type="submit" name="submit" className="submit col620 first left clearfix" value={intl.formatMessage({ id: 'event.attend' })} />
            }
            <input id="event_name" type="hidden" name="event_name" value={this.state.event_name} />
            <input id="event_startdate" type="hidden" name="event_startdate" value={this.state.event_startdate} />
            <input id="post-id" type="hidden" name="post_id" value={this.state.post_id} />
            <input id="reason" type="hidden" name="reason" value={this.state.reason} />
            <input id="built" type="hidden" name="built" value={this.state.built} />
            <input id="language" type="hidden" name="language" value={this.state.language} />
            <div className="bumper" />
            <small>* {intl.formatMessage({ id: 'contact.mandatory_fields' })}</small>
          </div>
        </form>
      </div>
    );
  }

  render() {
    return (
      <div>
        {(this.state.deadline_comp >= milli) ?
          this.renderForm() :
          <p>{this.props.intl.formatMessage({ id: 'event.deadline_passed' })}</p>
        }
      </div>
    )
  }
  
}

export default EventForm;
