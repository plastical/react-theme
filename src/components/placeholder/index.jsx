// External dependencies
import React from 'react';

const Placeholder = (props => 
  <div className="placeholder">
    {(props.type === 'comments') ?
      <p className="placeholder_comment">Loading comments…</p> :
      <h1 className="entry-title placeholder_title">Loading…</h1>
    }
  </div>
);

export default Placeholder;
