// External dependencies
import React, { Component } from 'react';
import { Link } from 'react-router';

class Media extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    let mediaElement;
    const media = this.props.media;
    let imgUrl;
    if (media.media_type === 'image') {
      if (this.props.size === 'thumb' && media.media_details.sizes['plastical-thumb-160']) {
        imgUrl = media.media_details.sizes['plastical-thumb-160'].source_url;
      } else if (this.props.size === 'medium' && media.media_details.sizes['plastical-thumb-320']) {
        imgUrl = media.media_details.sizes['plastical-thumb-320'].source_url;
      } else if (this.props.size === 'large' && media.media_details.sizes['plastical-thumb-640']) {
        imgUrl = media.media_details.sizes['plastical-thumb-640'].source_url;
      } else {
        imgUrl = media.source_url;
      }
    }

    switch (media.media_type) {
      case 'image':
        mediaElement = (
          <img 
            src={imgUrl} 
            alt={media.alt} 
          />
        );
        break;
      default:
        break;
    }

    return (
      <div className={this.props.parentClass}>
        {this.props.path ? 
          <Link className="entry_link" to={this.props.path} rel="bookmark">
            {mediaElement}
          </Link> :
          mediaElement
        }
      </div>
    );
  }
}

/* eslint react/forbid-prop-types: 1 */
Media.propTypes = {
  media: React.PropTypes.object.isRequired,
  parentClass: React.PropTypes.string,
}

export default Media;
