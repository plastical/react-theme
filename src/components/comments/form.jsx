/* eslint no-param-reassign: 1 */
/* eslint no-undef: 1 */
/* global PlasticalSettings */
// External dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { isSubmittingCommentOnPost } from 'wordpress-query-comments/lib/selectors';
import { submitComment } from 'wordpress-query-comments/lib/state';

class CommentForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorMessage: false
    }
  }

  onSubmit(e) {
    e.preventDefault();
    e.persist(); // We need this for the callback after a comment is posted.
    const keys = ['author', 'author_id', 'email', 'url', 'comment', 'comment_post_id', 'comment_parent'];

    const rawValues = {};
    keys.map((key) => {
      if (e.target[key]) {
        rawValues[key] = e.target[key].value;
      }
    });

    const values = {};
    values.author = rawValues.author_id;
    values.author_email = rawValues.email;
    values.author_name = rawValues.author;
    values.author_url = rawValues.url;
    values.content = rawValues.comment;
    values.post = rawValues.comment_post_id;

    if (!parseInt(rawValues.author_id, 10)) {
      delete values.author;
    }

    const submission = this.props.submitComment(values);
    submission.then((res) => {
      // No idea what happened.
      if (!res) {
        return;
      }
      // Clear the comment form
      e.target.comment.value = '';
            
      if (res.message && res.message === 'Conflict') {
        // clear form, show duplicate message
        this.setState({ errorMessage: 'Duplicate comment detected; it looks as though you’ve already said that!' });
        setTimeout(() => {
          this.setState({ errorMessage: false });
        }, 5000);
      }
    });
  }

  renderAnonFields() {
    const fields = [];
    fields.push(
      <p className="comment_form_notes" key="0">
        <span id="email-notes">Your email address will not be published.</span>
      </p>
    );

    fields.push(
      <div className="comment_form_required" key="1">
        <div className="comment_form_field comment_form_author">
          <label htmlFor="author">Name</label>
          <input id="author" name="author" type="text" aria-required="true" required="required" />
          <input id="author-id" name="author_id" type="hidden" value={PlasticalSettings.user} />
        </div>
        <div className="comment_form_field comment_form_email">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" aria-describedby="email-notes" aria-required="true" required="required" />
        </div>
      </div>
    );

    fields.push(
      <div className="comment_form_field comment_form_url" key="2">
        <label htmlFor="url">Website</label>
        <input id="url" name="url" type="url" />
      </div>
    );

    return fields;
  }

  renderLoggedInNotice() {
    return (
      <p className="comment_form_notes">
        <span id="email-notes">Logged in as {PlasticalSettings.userDisplay}.</span>
      </p>
    );
  }

  render() {
    const errorMessage = this.state.errorMessage ? <p className="error">{this.state.errorMessage}</p> : null;

    return (
      <form onSubmit={this.onSubmit}>
        {PlasticalSettings.user === 0 ? this.renderAnonFields() : this.renderLoggedInNotice()}

        {errorMessage}
        <div className="comment_form_field comment_form_comment">
          <label htmlFor="comment">Comment</label>
          <textarea id="comment" ref={(c) => { this.content = c }} name="comment" aria-required="true" required="required" />
        </div>
        <div className="comment-form-submit form-submit">
          <input id="submit" type="submit" name="submit" className="submit" value="Post Comment" disabled={this.props.isSubmitting} />
          <input id="comment-post-id" type="hidden" name="comment_post_id" value={this.props.postId} />
          <input id="comment-parent" type="hidden" name="comment_parent" defaultValue={0} />
        </div>
      </form>
    );
  }
}

export default connect(
  ((state, ownProps) => ({
    isSubmitting: isSubmittingCommentOnPost(state, ownProps.postId)
  })),
  ((dispatch) => bindActionCreators({ submitComment }, dispatch))
)(CommentForm);
