<?php
/**
* Plastical functions and definitions.
*
* @link https://developer.wordpress.org/themes/basics/theme-functions/
*
* @package Plastical
*/

/* Config theme directory whitin the the custom theme */
define('CONFIG_THEME_DIR', '/bin');

// Get Specific functions Up & Running!
require_once(get_template_directory() . CONFIG_THEME_DIR . '/client-core.php'); // core functions (don't remove)
require_once(get_template_directory() . CONFIG_THEME_DIR . '/events-post-type.php'); // events custom types
require_once(get_template_directory() . CONFIG_THEME_DIR . '/admin.php'); // custom admin functions
/**
* Thumbnail sizes
*/

add_image_size('plastical-thumb-640', 640, 640, true);
add_image_size('plastical-thumb-320', 320, 320, true);
add_image_size('plastical-thumb-160', 160, 160, true);
/* 
to add more sizes, simply copy a line from above 
and change the dimensions & name. As long as you
upload a "featured image" as large as the biggest
set width or height, all the other sizes will be
auto-cropped.

To call a different size, simply change the text
inside the thumbnail function.

For example, to call the 320 x 320 sized image, 
we would use the function:
<?php the_post_thumbnail( 'thumb-320' ); ?>
for the 640 x 640 image:
<?php the_post_thumbnail( 'thumb-640' ); ?>

You can change the names and dimensions to whatever
you like. Enjoy!
*/


function plastical_image_downsize( $value = false, $id, $size ) {
    if ( !wp_attachment_is_image($id) )
        return false;

    $img_url = wp_get_attachment_url($id);
    $is_intermediate = false;
    $img_url_basename = wp_basename($img_url);

    // try for a new style intermediate size
    if ( $intermediate = image_get_intermediate_size($id, $size) ) {
        $img_url = str_replace($img_url_basename, $intermediate['file'], $img_url);
        $is_intermediate = true;
    }
    elseif ( $size == 'thumbnail' ) {
        // Fall back to the old thumbnail
        if ( ($thumb_file = wp_get_attachment_thumb_file($id)) && $info = getimagesize($thumb_file) ) {
            $img_url = str_replace($img_url_basename, wp_basename($thumb_file), $img_url);
            $is_intermediate = true;
        }
    }

    // We have the actual image size, but might need to further constrain it if content_width is narrower
    if ( $img_url) {
        return array( $img_url, 0, 0, $is_intermediate );
    }
    return false;
}

add_filter( 'image_downsize', 'plastical_image_downsize', 1, 3 );

	
// remove the p from around imgs (http://css-tricks.com/snippets/wordpress/remove-paragraph-tags-from-around-images/)
function filter_ptags_on_images($content){
   return preg_replace('/<p>\s*(<a .*>)?\s*(<img .* \/>)\s*(<\/a>)?\s*<\/p>/iU', '\1\2\3', $content);
}
add_filter('the_content', 'filter_ptags_on_images');

/**
 * Plastical only works if the REST API is available
 */
if (version_compare($GLOBALS['wp_version'], '4.6-alpha', '<')) {
	require get_template_directory() . CONFIG_THEME_DIR . '/compat-warnings.php';
	return;
}

if (!defined('PLASTICAL_VERSION')) {
	define('PLASTICAL_VERSION', '1');
}

if (!defined('PLASTICAL_APP')) {
	define('PLASTICAL_APP', 'plastical-react');
}

if (!defined('PLASTICAL_VENDOR')) {
	define('PLASTICAL_VENDOR', 'plastical-vendor-bundle');
}

/**
 * Sets up theme defaults and registers support for various WordPress features.
 *
 * Note that this function is hooked into the after_setup_theme hook, which
 * runs before the init hook. The init hook is too late for some features, such
 * as indicating support for post thumbnails.
 */
function plastical_setup() {
	/*
	 * Make theme available for translation.
	 * Translations can be filed in the /languages/ directory.
	 * If you're building a theme based on Plastical, use a find and replace
	 * to change 'plastical' to the name of your theme in all the template files.
	 */
	load_theme_textdomain('plastical', get_template_directory() . CONFIG_THEME_DIR . '/languages');

	// Add default posts and comments RSS feed links to head.
	//add_theme_support('automatic-feed-links');

	/*
	 * Let WordPress manage the document title.
	 * By adding theme support, we declare that this theme does not use a
	 * hard-coded <title> tag in the document head, and expect WordPress to
	 * provide it for us.
	 */
	add_theme_support('title-tag');

	/*
	 * Enable support for Post Thumbnails on posts and pages.
	 *
	 * @link https://developer.wordpress.org/themes/functionality/featured-images-post-thumbnails/
	 */
	add_theme_support('post-thumbnails');

	// This theme uses wp_nav_menu() in more than one location due to localization issues.
	register_nav_menus(array(
		'primary-en' => esc_html__('Primary Menu for EN', 'plastical'),
    'primary-it' => esc_html__('Primary Menu for IT', 'plastical'),
	));

	/*
	 * Switch default core markup for search form, comment form, and comments
	 * to output valid HTML5.
	 */
	add_theme_support('html5', array(
		'search-form',
		'comment-form',
		'comment-list',
		'gallery',
		'caption',
	));

	add_post_type_support('post', 'comments');
	// add_post_type_support('page', 'comments');
}
add_action('after_setup_theme', 'plastical_setup');

/**
 * Enqueue scripts and styles.
 */
function plastical_scripts() {
  $bundleDir = ($isWithinTemplate) ? get_template_directory_uri() : '/assets';

	wp_enqueue_style('plastical-style', $bundleDir . '/build/bundle.css');
  wp_enqueue_script(PLASTICAL_VENDOR, $bundleDir . '/build/vendor.bundle.js', array('jquery'), PLASTICAL_VERSION, true);
	wp_enqueue_script(PLASTICAL_APP, $bundleDir . '/build/bundle.js', array('jquery'), PLASTICAL_VERSION, true);

	if (class_exists('Jetpack_Tiled_Gallery')) {
		Jetpack_Tiled_Gallery::default_scripts_and_styles();
	}

	$url = trailingslashit(site_url());
  $home = trailingslashit(home_url());
	$path = trailingslashit(wp_parse_url($home)['path']);

	$front_page_slug = false;
	$blog_page_slug = false;
	if ('posts' !== get_option('show_on_front')) {
		$front_page_id = get_option('page_on_front');
		$front_page = get_post($front_page_id);
		if ($front_page->post_name) {
			$front_page_slug = $front_page->post_name;
		}

		$blog_page_id = get_option('page_for_posts');
    if($blog_page_id) {
		  $blog_page = get_post($blog_page_id);
		  if ($blog_page->post_name) {
			  $blog_page_slug = $blog_page->post_name;
		  }
    }
	}

	$user_id = get_current_user_id();
	$user = get_userdata($user_id);
  $canEdit = current_user_can('edit_post');

	wp_scripts()->add_data(PLASTICAL_APP, 'data', sprintf(
		'var SiteSettings = %s; var PlasticalSettings = %s;',
		wp_json_encode(array(
			'endpoint' => esc_url_raw($url),
			'nonce' => wp_create_nonce('wp_rest')
		) ),
		wp_json_encode(array(
      'lang' => 'it',
			'user' => get_current_user_id(),
			'userDisplay' => $user ? $user->display_name : '',
      'canEdit' => $canEdit,
			'frontPage' => array(
				'page' => $front_page_slug,
				'blog' => $blog_page_slug,
			),
			'URL' => array(
				'base' => esc_url_raw($home),
				'path' => $path,
			),
			'meta' => array(
				'title' => get_bloginfo('name', 'display'),
				'description' => get_bloginfo('description', 'display'),
			),
      'facebookAppId' => FACEBOOK_APPID,
      'twitterHandler' => TWITTER_HANDLER
		) )
	) );
}
add_action('wp_enqueue_scripts', 'plastical_scripts');

/**
* Add "pagename" to the accepted parameters in the query for page requests via API.
*/
function plastical_add_path_to_page_query($args, $request) {
	if (isset($request['pagename'])) {
		$args['pagename'] = $request['pagename'];
	}
	return $args;
}
add_filter('rest_page_query', 'plastical_add_path_to_page_query', 10, 2);

// Allow anon comments via API when using this theme.
// add_filter('rest_allow_anonymous_comments', '__return_true');

// remove legacy compatibility with jQuery...
add_action( 'wp_default_scripts', function( $scripts ) {
    if ( ! empty( $scripts->registered['jquery'] ) ) {
        $jquery_dependencies = $scripts->registered['jquery']->deps;
        $scripts->registered['jquery']->deps = array_diff( $jquery_dependencies, array( 'jquery-migrate' ) );
    }
} );

// Add rest query vars for custom filtering
function plastical_add_rest_query_vars($query_vars) {
    $query_vars = array_merge($query_vars, array('meta_key', 'meta_value', 'meta_compare', 'meta_query'));
    return $query_vars;
}
add_filter('rest_query_vars', 'plastical_add_rest_query_vars', PHP_INT_MAX, 1);

// Include extra functionality.
require get_template_directory() . CONFIG_THEME_DIR . '/load-menu.php';
require get_template_directory() . CONFIG_THEME_DIR . '/permalinks.php';
