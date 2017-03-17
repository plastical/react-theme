// External dependencies
import React from 'react';

// Internal dependencies
import Event from './single';
import Placeholder from '../placeholder';

const EventList = (props) => {
  if (!props.events) {
    return null;
  }

  if (!props.pastEvents && !props.events) {
    return null;
  }

  let events;

  if (props.past) {
    events = props.pastEvents.map((event, i) => 
      <Event key={`event-${i}`} {...event} {...props} />
    );
  } else {
    events = props.events.map((event, i) => 
      <Event key={`event-${i}`} {...event} {...props} />
    );
  }

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
