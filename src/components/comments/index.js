// External dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';

// Internal dependencies
import BodyClass from 'utils/react-body-class';
import QueryComments from 'wordpress-query-comments';
import { isRequestingCommentsForPost, getCommentsForPost, getTotalCommentsForPost } from 'wordpress-query-comments/lib/selectors';

// Components
// import CommentPagination from '../pagination/comments';
import Comment from './single';
import CommentForm from './form';
import Placeholder from 'components/placeholder';

class Comments extends Component {
  renderForm() {
    return (
      <div className="comment_respond">
        <h3 className="comment_reply_title">Leave a Reply</h3>

        <CommentForm postId={this.props.postId} />
      </div>
    );
  }

  render() {
    // If this is a protected post, we don't want to display comments.
    if (this.props.isProtected) {
      return null;
    }
    const comments = this.props.comments;

    let titleString = 'One comment on ';
    if (this.props.total > 1) {
      titleString = `${this.props.total} comments on `;
    }

    return (
      <div className="comments_area" ref={(c) => { this.comments = c }}>
        <QueryComments postId={this.props.postId} />
        <BodyClass classes={{ 'has-comments': !!this.props.total }} />
        {(this.props.total === 0) ?
          null :
          <h2 className="comments_title">{titleString}&ldquo;{this.props.title}&rdquo;</h2>
        }

        {this.props.loading ?
          <Placeholder type="comments" /> :
          <CommentsList comments={this.props.comments} />
        }

        {!this.props.loading && this.props.commentsOpen && this.renderForm()}
      </div>
    );
  }
}

const CommentsList = (props) => { 
  if (props.comments && props.comments.length) {
    return ( 
      <ol className="comment_list">
        {props.comments.map((item, i) => 
          <Comment key={i} comment={item} />         
        )}
      </ol> 
    );
  }
  return null;
}

export default connect((state, ownProps) => {
  const locale = state.locale;
  const postId = ownProps.postId;
  const comments = getCommentsForPost(state, postId);
  const requesting = isRequestingCommentsForPost(state, postId);

  return {
    locale,
    postId,
    comments,
    requesting,
    loading: requesting && !comments,
    total: getTotalCommentsForPost(state, postId),
  };
})(Comments);
