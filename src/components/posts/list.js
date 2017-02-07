// External dependencies
import React from 'react';

// Internal dependencies
import Post from './single';
import Placeholder from '../placeholder';

const PostList = (props) => {
  if (!props.posts) {
    return null;
  }

  const posts = props.posts.map((post, i) => 
    <Post key={`post-${i}`} {...post} {...props} />
  );

  return (
    <div className="entry_list">
      {posts.length > 0 || props.noPreload ?
        posts :
        <Placeholder />
      }  
    </div>
  );
}

export default PostList;
