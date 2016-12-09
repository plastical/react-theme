<?php
/* 
		Core functions' file. Edit functions for add ons.
*/

// Adding Translation Option
load_theme_textdomain('plastical', TEMPLATEPATH.'/languages');
$locale = get_locale();
$locale_file = TEMPLATEPATH."/languages/$locale.php";
if ( is_readable($locale_file) ) require_once($locale_file);

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
	remove_action( 'wp_head', 'wp_generator' );                           // WP version
  remove_action('wp_head', 'wp_shortlink_wp_head');
  add_filter('show_admin_bar','__return_false');            // #7
  remove_action( 'wp_head', 'print_emoji_detection_script', 7 );  // #8
  remove_action( 'wp_print_styles', 'print_emoji_styles' );
	//if (!is_admin()) {
		//wp_deregister_script('jquery');                                   // De-Register jQuery
		//wp_register_script('jquery', '', '', '', true);                   // It's already in the Header
	//}	
}
	// launching operation cleanup
	add_action('init', 'client_head_cleanup');

	// remove WP version from RSS
	function client_rss_version() { return ''; }
	add_filter('the_generator', 'client_rss_version');
	
// loading jquery reply elements on single pages automatically
function client_queue_js(){ if (!is_admin()){ if ( is_singular() AND comments_open() AND (get_option('thread_comments') == 1)) wp_enqueue_script( 'comment-reply' ); }
}
	// reply on comments script
	add_action('wp_print_scripts', 'client_queue_js');


// Custom Byline -- NEED TO CODE A HOOK?
/*function client_byline($byline) {
	if ( 'post' == get_post_type() )
		$byline = '<p class="byline">[entry-published] [entry-edit-link before=" | "]</p>';
	return $byline;
}
add_filter('byline', 'client_byline');*/


/*function add_class_to_excerpt( $excerpt ) {
    return str_replace('<p', '<p class="col700 left first"', $excerpt);
}
add_filter( "the_excerpt", "add_class_to_excerpt" );*/

/* excerpt length */
function client_excerpt_length($length) {
	return 32;
}
add_filter('excerpt_length', 'client_excerpt_length');

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
$more = 'More';
// if there's no active WPLM active:  $more = 'more';
return '... <p><a class="action alignright" href="'. get_permalink($post->ID) . '" title="'.get_the_title($post->ID).'">'.$more.' &raquo;</a></p><p class="clearfix"></p>';
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
define('ICL_DONT_LOAD_LANGUAGE_SELECTOR_CSS', true);
define('ICL_DONT_LOAD_LANGUAGES_JS', true);
	
// Adding WP 3+ Functions & Theme Support
function client_theme_support() {
	add_theme_support('post-thumbnails');      // wp thumbnails (sizes handled in functions.php)
	set_post_thumbnail_size(125, 125, true);   // default thumb size
	add_custom_background();                   // wp custom background
	add_theme_support('automatic-feed-links'); // rss thingy
	// to add header image support go here: http://themble.com/support/adding-header-background-image-support/
	// adding post format support
	//add_theme_support( 'post-formats',      // post formats
		//array( 
			//'aside',   // title less blurb
			//'gallery', // gallery of images
			//'link',    // quick link to other site
			//'image',   // an image
			//'quote',   // a quick quote
			//'status',  // a Facebook like status update
			//'video',   // video 
			//'audio',   // audio
			//'chat'     // chat transcript 
		//)
	//);	
	add_theme_support('menus');            // wp menus
	register_nav_menus(                      // wp3+ menus
		array( 
			'main_nav' => 'The Main Menu',   // main nav in header
			'footer_links' => 'Footer Links', // secondary nav in footer
			'footer_links_secondary' => 'Secondary Footer Links' // tiertiary nav in footer
		)
	);	
}

	// launching this stuff after theme setup
	add_action('after_setup_theme','client_theme_support');	
	// adding sidebars to Wordpress (these are created in functions.php)
	add_action('widgets_init', 'client_register_sidebars');
	// adding the client search form (created in functions.php)
	add_filter('get_search_form', 'client_wpsearch');
	
function remove_element($arr, $val){
foreach ($arr as $key => $value){
if ($arr[$key] == $val){
unset($arr[$key]);
}
}
return $arr = array_values($arr);
}

class client_walker extends Walker_Nav_Menu {

	function start_el(&$output, $item, $depth, $args) {
		global $wp_query;
		$indent = ( $depth ) ? str_repeat( "\t", $depth ) : '';

		$class_names = $value = '';

		$classes = empty( $item->classes ) ? array() : (array) $item->classes;

		$class_names = join( ' ', apply_filters( 'nav_menu_css_class', array_filter( $classes ), $item ) );		
		$class_names = ' class="' . esc_attr( $class_names ) . '"';

		$output .= $indent . '<li id="menu-item-'. $item->ID . '"' . $value . $class_names .'>';

		$attributes  = ! empty($item->attr_title) ? ' title="' . esc_attr( $item->attr_title) .'"' : '';
		$attributes .= ! empty($item->target) ? ' target="'. esc_attr( $item->target) .'"' : '';
		$attributes .= ! empty($item->xfn) ? ' rel="' . esc_attr( $item->xfn) .'"' : '';
		$attributes .= ! empty($item->url) ? ' href="'. esc_attr( $item->url) .'"' : '';

		$item_output = $args->before;
		$item_output .= '<a'. $attributes .'>';
		$item_output .= $args->link_before . apply_filters('the_title', $item->title, $item->ID) . $args->link_after;
		$item_output .= '<br /><span class="sub">' . $item->description . '</span>';
		$item_output .= '</a>';
		$item_output .= $args->after;

		$output .= apply_filters('walker_nav_menu_start_el', $item_output, $item, $depth, $args);
	}
}	

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

function client_main_nav() {
	// display the wp3 menu if available
	$walker = new client_walker;
    	wp_nav_menu(array( 
    		'menu' => 'main_nav', /* menu name */
    		'theme_location' => 'main_nav', /* where in the theme it's assigned */
    		'container_class' => 'menu clearfix', /* container class */
    		'fallback_cb' => 'client_main_nav_fallback', /* menu fallback */
			'walker' => $walker /* customizes the output of the menu */
    	));
}

function client_footer_links() { 
	// display the wp3 menu if available	
    wp_nav_menu(
    	array(
    		'menu' => 'footer-links', /* menu name */
    		'theme_location' => 'footer_links', /* where in the theme it's assigned */
    		'container_class' => 'footer-links clearfix', /* container class */
    		'fallback_cb' => 'client_footer_links_fallback', /* menu fallback */
    	)
	);
}

function client_footer_links_secondary() { 
	// display the wp3 menu if available
    wp_nav_menu(
    	array(
    		'menu' => 'footer-links-secondary', /* menu name */
    		'theme_location' => 'footer_links', /* where in the theme it's assigned */
    		'container_class' => 'footer-links footer-links-secondary clearfix', /* container class */
    		'fallback_cb' => 'client_footer_links_fallback', /* menu fallback */
    	)
	);
}
 
// this is the fallback for header menu
function client_main_nav_fallback() { 
	wp_page_menu( 'show_home=Home&menu_class=menu' ); 
}

// this is the fallback for footer menu
function client_footer_links_fallback() { 
	/* you can put a default here if you like */ 
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
	
// remove the p from around imgs (http://css-tricks.com/snippets/wordpress/remove-paragraph-tags-from-around-images/)
function filter_ptags_on_images($content){
   return preg_replace('/<p>\s*(<a .*>)?\s*(<img .* \/>)\s*(<\/a>)?\s*<\/p>/iU', '\1\2\3', $content);
}
add_filter('the_content', 'filter_ptags_on_images');

?>