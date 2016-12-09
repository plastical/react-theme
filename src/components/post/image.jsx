// External dependencies
import React, { Component } from 'react';

const Media = (props) => {
  let mediaElement;
  const media = this.props.media;

  switch (media.media_type) {
    case 'image':
      mediaElement = (
        <img src={media.source_url} alt={media.alt} />
      );
      break;
    default:
      break;
  }

  return (
    <div className={this.props.parentClass}>
      {mediaElement}
    </div>
  );
}

Media.propTypes = {
  media: React.PropTypes.isRequired,
  parentClass: React.PropTypes.string,
}

export default Media;
