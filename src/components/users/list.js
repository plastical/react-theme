// External dependencies
import React, { Component } from 'react';

// Internal dependencies
import User from './single';
import Placeholder from '../placeholder';

const UserList = (props) => {
  if (!props.users) {
    return null;
  }

  const users = props.users.map((user, i) =>        
    <User key={`user-${i}`} {...user} {...props} />
  );

  return (
    <div className="entry_list">
      {users.length > 0 || props.noPreload ?
        users :
        <Placeholder />      
      }
    </div>
  );
}

export default UserList;
