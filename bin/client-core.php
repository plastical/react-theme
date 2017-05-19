<?php
/* 
		Core functions' file. Edit functions for add ons.
*/

// Adding Translation Option
load_theme_textdomain('plastical', TEMPLATEPATH.'/languages');
$locale = get_locale();
$locale_file = TEMPLATEPATH."/languages/$locale.php";
if (is_readable($locale_file)) require_once($locale_file);

// Cleaning up the Wordpress Head
function client_head_cleanup() {
	// remove header links
	remove_action( 'wp_head', 'feed_links_extra', 3 );                 // Category Feeds
	remove_action( 'wp_head', 'feed_links', 2 );                       // Post and Comment Feeds
	remove_action( 'wp_head', 'rsd_link' );                               // EditURI link
	remove_action( 'wp_head', 'wlwmanifest_link' );                       // Windows Live Writer
	remove_action( 'wp_head', 'index_rel_link' );                         // index link
	remove_action( 'wp_head', 'parent_post_rel_link', 10, 0 );            // previous link
	remove_action( 'wp_head', 'start_post_rel_link', 10, 0 );             // start link
	remove_action( 'wp_head', 'adjacent_posts_rel_link_wp_head', 10, 0 ); // Links for Adjacent Posts
	remove_action( 'wp_head', 'wp_generator', 10 ,0);                           // WP version
  remove_action('wp_head', 'wp_shortlink_wp_head');
  add_filter('show_admin_bar','__return_false');            // #7
  remove_action( 'wp_head', 'print_emoji_detection_script', 7 );  // #8
  remove_action( 'wp_print_styles', 'print_emoji_styles' );
  global $sitepress;
  remove_action( 'wp_head', array($sitepress, 'meta_generator_tag' ) );
	//if (!is_admin()) {
		//wp_deregister_script('jquery');                                   // De-Register jQuery
		//wp_register_script('jquery', '', '', '', true);                   // It's already in the Header
	//}	
  //remove oembed script...
  wp_deregister_script( 'wp-embed' );
}

// launching operation client_head_cleanup
add_action('init', 'client_head_cleanup');

// remove WP version from RSS
function client_rss_version() { return ''; }
add_filter('the_generator', 'client_rss_version');

/* excerpt length */
function client_excerpt_length($length) {
	return 32;
}
add_filter('excerpt_length', 'client_excerpt_length');

function get_page_meta_welcome_txt($object) { // no need to call a single field_name
  $array_data = [];  
  if(get_post_meta($object['id'], 'welcome_txt', true) != '')
    $array_data['welcome_txt'] = get_post_meta($object['id'], 'welcome_txt', true);

  return $array_data;
}
function register_pages_meta_rest() {
  register_rest_field('page', 'meta', [
      'get_callback'    => 'get_page_meta_welcome_txt',
      'update_callback' => 'null',
      'schema'          => 'null',
  ]);
}
add_action('rest_api_init', 'register_pages_meta_rest');

/* custom excerpt */
function get_client_excerpt($length){
$excerpt = get_the_content();
$excerpt = preg_replace(" (\[.*?\])",'',$excerpt);
$excerpt = strip_shortcodes($excerpt);
$excerpt = strip_tags($excerpt);
$excerpt = substr($excerpt, 0, $length);
$excerpt = substr($excerpt, 0, strripos($excerpt, " "));
$excerpt = trim(preg_replace( '/\s+/', ' ', $excerpt));
$excerpt = $excerpt.'...';
return $excerpt;
}

// Fixing the Read More in the Excerpts
// This removes the annoying […] to a Read More link & add excerpt more with language detection 

function client_excerpt_more($more) {
global $post;
if(ICL_LANGUAGE_CODE == 'en')
$more = 'More';
else if(ICL_LANGUAGE_CODE == 'de')
$more = 'Mehr';
else if(ICL_LANGUAGE_CODE == 'fr')
$more = 'Continuez';
else if(ICL_LANGUAGE_CODE == 'it')
$more = 'Continua';
else 
$more = 'Continua';
// if there's no active WPLM active:  $more = 'more';
return '... <a class="excerpt" href="'. get_permalink($post->ID) . '" title="'.get_the_title($post->ID).'">&nbsp;</a><p class="clearfix"></p>';
}
add_filter('excerpt_more', 'client_excerpt_more');

// Language set up

function client_set_language() {
	$languages = icl_get_languages('skip_missing=0&orderby=code');
	echo '<div id="language"><ul>';
	if(!empty($languages)){
		foreach($languages as $l){
			echo '<li>';
			if(!$l['active']) echo '<a href="'.$l['url'].'" title="'.$l['native_name'].'">';
			echo ''.$l['language_code'].'';
			if(!$l['active']) echo '</a>';
			echo '</li>';
		}
	}
	echo '</ul></div>';
}

// WPML
define('ICL_DONT_LOAD_NAVIGATION_CSS', true);
define('ICL_DONT_LOAD_LANGUAGE_SELECTOR_CSS', true);
define('ICL_DONT_LOAD_LANGUAGES_JS', true);

function is_page_tree($pid) { // $pid = The ID of the page we're looking for pages underneath
	global $post; // load details about this page

    if (is_page($pid))
        return true; // we're at the page or at a sub page

    $anc = get_post_ancestors($post->ID); 
    foreach ($anc as $ancestor) {
        if(is_page() && $ancestor == $pid) {
           return true;
        }
    }

    return false;  // we arn't at the page, and the page is not an ancestor
}

function is_post_tree( $cid ) {
	if(in_category( (int) $cid ))
		return true;	
	
	//$children = get_categories(array( 'child_of' => $pid, 'hide_empty' => 0 ));
	//if (count($children) > 1)
		//return true;
	//return false;
	$category = get_category($cid);
    if ($category->category_parent > 0)
        return true;
    return false;
}

/****************** PLUGINS & EXTRA FEATURES **************************/

// Related Posts Function (call using client_related_posts(); )
function client_related_posts() {
	echo '<ul id="related-posts">';
	global $post;
	$tags = wp_get_post_tags($post->ID);
	if($tags) {
		foreach($tags as $tag) { $tag_arr .= $tag->slug . ','; }
        $args = array(
        	'tag' => $tag_arr,
        	'numberposts' => 5, /* you can change this to show more */
        	'post__not_in' => array($post->ID)
     	);
        $related_posts = get_posts($args);
        if($related_posts) {
        	foreach ($related_posts as $post) : setup_postdata($post); ?>
	           	<li class="related_post"><a href="<?php the_permalink() ?>" title="<?php the_title_attribute(); ?>"><?php the_title(); ?></a></li>
	        <?php endforeach; } 
	    else { ?>
            <li class="no_related_post"><!-- No Related Posts Yet! --></li>
		<?php }
	}
	wp_reset_query();
	echo '</ul>';
}

// Numeric Page Navi (built into the theme by default)
function page_navi($before = '', $after = '') {
	global $wpdb, $wp_query;
	$request = $wp_query->request;
	$posts_per_page = intval(get_query_var('posts_per_page'));
	$paged = intval(get_query_var('paged'));
	$numposts = $wp_query->found_posts;
	$max_page = $wp_query->max_num_pages;
	if ( $numposts <= $posts_per_page ) { return; }
	if(empty($paged) || $paged == 0) {
		$paged = 1;
	}
	$pages_to_show = 7;
	$pages_to_show_minus_1 = $pages_to_show-1;
	$half_page_start = floor($pages_to_show_minus_1/2);
	$half_page_end = ceil($pages_to_show_minus_1/2);
	$start_page = $paged - $half_page_start;
	if($start_page <= 0) {
		$start_page = 1;
	}
	$end_page = $paged + $half_page_end;
	if(($end_page - $start_page) != $pages_to_show_minus_1) {
		$end_page = $start_page + $pages_to_show_minus_1;
	}
	if($end_page > $max_page) {
		$start_page = $max_page - $pages_to_show_minus_1;
		$end_page = $max_page;
	}
	if($start_page <= 0) {
		$start_page = 1;
	}
	echo $before.'<nav id="pagination" class="page_navigation"><ol class="page_navi clearfix">'."";
	if ($start_page >= 2 && $pages_to_show < $max_page) {
		$first_page_text = __('First');
		echo '<li class="first_page_link"><a href="'.get_pagenum_link().'" title="'.$first_page_text.'">'.$first_page_text.'</a></li>';
	}
	echo '<li class="prev_link">';
	previous_posts_link('«');
	echo '</li>';
	for($i = $start_page; $i  <= $end_page; $i++) {
		if($i == $paged) {
			echo '<li class="current_link">'.$i.'</li>';
		} else {
			echo '<li><a href="'.get_pagenum_link($i).'">'.$i.'</a></li>';
		}
	}
	echo '<li class="next_link">';
	next_posts_link('»');
	echo '</li>';
	if ($end_page < $max_page) {
		$last_page_text = __('Last');
		echo '<li class="last_page_link"><a href="'.get_pagenum_link($max_page).'" title="'.$last_page_text.'">'.$last_page_text.'</a></li>';
	}
	echo '</ol></nav>'.$after."";
}

?>