<?php

/*

*/


/* 
Social Integration
This is a collection of snippets I edited or reused from
social plugins. No need to use a plugin when you can 
replicate it in only a few lines I say, so here we go.
For more info, or to add more open graph stuff, check
out: http://yoast.com/facebook-open-graph-protocol/
*/

// get the image for the google + and facebook integration 
function plastical_get_socialimage() {
  global $post, $posts;

  $src = wp_get_attachment_image_src( get_post_thumbnail_id($post->ID), '', '' );

  if ( has_post_thumbnail($post->ID) ) {
    $socialimg = $src[0];
  } else {
    $socialimg = '';
    $output = preg_match_all('/<img.+src=[\'"]([^\'"]+)[\'"].*>/i', $post->post_content, $matches);
    if (array_key_exists(1, $matches))
      if (array_key_exists(0, $matches[1]))
        $socialimg = $matches [1] [0];
  }

  if(empty($socialimg))
    $socialimg = get_template_directory_uri() . '/library/images/nothumb.gif';

  return $socialimg;
}

// facebook share correct image fix (thanks to yoast)
function plastical_facebook_connect() {
	echo "\n" . '<!-- facebook open graph stuff -->' . "\n";
	echo '<!-- place your facebook app id below -->';
	echo '<meta property="fb:app_id" content="1234567890"/>' . "\n";
	global $post;	
	echo '<meta property="og:site_name" content="'. get_bloginfo("name") .'"/>' . "\n";
	echo '<meta property="og:url" content="'. get_permalink() .'"/>' . "\n";
	echo '<meta property="og:title" content="'.get_the_title().'" />' . "\n";
	if (is_singular()) {
		echo '<meta property="og:type" content="article"/>' . "\n";
		echo '<meta property="og:description" content="' .strip_tags( get_the_excerpt() ).'" />' . "\n";
	}
	echo '<meta property="og:image" content="'. plastical_get_socialimage() .'"/>' . "\n";
	echo '<!-- end facebook open graph -->' . "\n";
}

// google +1 meta info
function plastical_google_header() {
	if (is_singular()) {
		echo '<!-- google +1 tags -->' . "\n";
		global $post;
		echo '<meta itemprop="name" content="'.get_the_title().'">' . "\n";
		echo '<meta itemprop="description" content="' .strip_tags( get_the_excerpt() ).'">' . "\n";
		echo '<meta itemprop="image" content="'. plastical_get_socialimage() .'">' . "\n";
		echo '<!-- end google +1 tags -->' . "\n";
	}
}
	
	// add this in the header 
	add_action('wp_head', 'plastical_facebook_connect');
	add_action('wp_head', 'plastical_google_header');

	
// adding the rel=me thanks to yoast	
function yoast_allow_rel() {
	global $allowedtags;
	$allowedtags['a']['rel'] = array ();
}
add_action( 'wp_loaded', 'yoast_allow_rel' );

// adding facebook, twitter, & google+ links to the user profile
function plastical_add_user_fields( $contactmethods ) {
	// Add Facebook
	$contactmethods['user_fb'] = 'Facebook';
	// Add Twitter
	$contactmethods['user_tw'] = 'Twitter';
	// Add Google+
	$contactmethods['google_profile'] = 'Google Profile URL';
	// Save 'Em
	return $contactmethods;
}
add_filter('user_contactmethods','plastical_add_user_fields',10,1);


?>
