// External dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';

// Internal dependencies
import { getTitle, getContent, getDate, getTime } from 'utils/content-mixin';
import { getComment } from 'wordpress-query-comments/lib/selectors';

const Comment = (props) => {
  const comment = props.comment;
  const classes = 'comment'; // byuser comment-author-melchoyce even thread-even depth-1

  let replyParentString = null;
  if (props.parent) {
    replyParentString = (
      <span>In reply to {props.parent.author_name}&nbsp;&bull;&nbsp;</span>
    );
  }

  return (
    <li className={classes}>
      <article className="comment_body">
        <footer className="comment_meta">
          <div className="comment_avatar vcard">
            <img alt="" src={comment.author_avatar_urls['96']} />
          </div>

          <div className="comment_author">
            { (comment.author_url !== '') ?
              <a href={comment.author_url} className="fn">{comment.author_name}</a> :
              <span className="fn">{comment.author_name}</span>
            }
          </div>

          <div className="comment_metadata">
            {replyParentString}
            <time dateTime={comment.date}>{getDate(comment)} at {getTime(comment)}</time>
          </div>
        </footer>

        <div className="comment_content" dangerouslySetInnerHTML={getContent(comment)} />

        {(comment.status === 'hold') ?
          <div className="comment_status">
            Your comment is pending approval
          </div> :
          null
        }

      </article>
    </li>
  );
}

export default connect((state, ownProps) => {
  const commentParent = ownProps.comment.parent || false;

  return {
    parent: commentParent ? getComment(state, commentParent) : false,
  };
})(Comment);
