// External dependencies
import React from 'react';

// Internal dependencies
import Event from './single';
import Placeholder from '../placeholder';

const EventList = (props) => {
  if (!props.events) {
    return null;
  }

  const events = props.events.map((event, i) => 
    <Event key={`event-${i}`} {...event} {...props} />
  );

  return (
    <div className="entry_list">
      {events.length > 0 || props.noPreload ?
        events :
        <Placeholder />      
      }
    </div>
  );
}

export default EventList;
