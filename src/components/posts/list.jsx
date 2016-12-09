// External dependencies
import React, { Component } from 'react';

// Internal dependencies
import Post from './single';

class PostList extends Component {
  render() {
    if (!this.props.posts) {
      return null;
    }

    const posts = this.props.posts.map((post, i) => 
      <Post key={`post-${i}`} {...post} />
    );

    return (
      <div className="site_main">
        {posts}
      </div>
    );
  }
}

export default PostList;
