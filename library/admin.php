<?php
/* 


Developed by: Plastical
URL: http://plastical.com/


*/

/************* DASHBOARD WIDGETS *****************/

// disable default dashboard widgets
function disable_default_dashboard_widgets() {
	if (!current_user_can('administrator')) { remove_meta_box('dashboard_right_now', 'dashboard', 'core'); }   // Right Now Widget
	remove_meta_box('dashboard_recent_comments', 'dashboard', 'core'); // Comments Widget
	remove_meta_box('dashboard_incoming_links', 'dashboard', 'core');  // Incoming Links Widget
	remove_meta_box('dashboard_plugins', 'dashboard', 'core');         // Plugins Widget

	remove_meta_box('dashboard_quick_press', 'dashboard', 'core');  // Quick Press Widget
	remove_meta_box('dashboard_recent_drafts', 'dashboard', 'core');   // Recent Drafts Widget
	remove_meta_box('dashboard_primary', 'dashboard', 'core');         // Wordpress Blog Feed
	remove_meta_box('dashboard_secondary', 'dashboard', 'core');       // Other Wordpress News
	
	// removing plugin dashboard boxes 
	remove_meta_box('yoast_db_widget', 'dashboard', 'normal');         // Yoast's SEO Plugin Widget
	remove_meta_box('rg_forms_dashboard', 'dashboard', 'normal');      // Gravity Forms Widget
	remove_meta_box('icl_dashboard_widget','dashboard','normal');						// WPML Multilingual Widget
	
}

// RSS Dashboard Widget 
function plastical_rss_dashboard_widget() {
	if(function_exists('fetch_feed')) {
		include_once(ABSPATH . WPINC . '/feed.php');               // include the required file
		$feed = fetch_feed('http://blog.plastical.com/feed/');        // specify the source feed
		$limit = $feed->get_item_quantity(7);                      // specify number of items
		$items = $feed->get_items(0, $limit);                      // create an array of items
	}
	if ($limit == 0) echo '<div>The RSS Feed is either empty or unavailable.</div>';   // fallback message 
	else foreach ($items as $item) : ?>

	<h4 style="margin-bottom: 0;">
		<a href="<?php echo $item->get_permalink(); ?>" title="<?php echo $item->get_date('j F Y @ g:i a'); ?>" target="_blank">
			<?php echo $item->get_title(); ?>
		</a>
	</h4>
	<p style="margin-top: 0.5em;">
		<?php echo substr($item->get_description(), 0, 200); ?> 
	</p>
	<?php endforeach; 
}

// calling all custom dashboard widgets
function plastical_custom_dashboard_widgets() {
	wp_add_dashboard_widget('plastical_rss_dashboard_widget', 'Plastical\'s Blog', 'plastical_rss_dashboard_widget');
	/*
	Be sure to drop any other created Dashboard Widgets 
	in this function and they will all load.
	*/
}

// removing the dashboard widgets
add_action('admin_menu', 'disable_default_dashboard_widgets');
// adding any custom widgets
add_action('wp_dashboard_setup', 'plastical_custom_dashboard_widgets');


/************* CUSTOM LOGIN PAGE *****************/

if (basename($_SERVER['PHP_SELF']) == 'wp-login.php') 
    add_action( 'style_loader_tag', create_function( '$a', "return null;" )); 

if (!function_exists('plastical_custom_login')) {
    function plastical_custom_login() { 
        //echo '<link rel="stylesheet" type="text/css" href="' . get_bloginfo('template_directory') . '/custom-login/custom-login.css" />'; 
				echo '<link rel="stylesheet" href="/assets/css/base.css">';
				echo '<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>';
				echo '<script src="/assets/js/libs/modernizr.custom.min.js"></script>';
    } 
    add_action('login_head', 'plastical_custom_login'); 
} 

// calling your own login css so you can style it 
function plastical_login_css() {
	/* i couldn't get wp_enqueue_style to work :( */
	echo '<link rel="stylesheet" href="assets/css/login.css">';
}

// changing the logo link from wordpress.org to your site 
function plastical_login_url() { echo bloginfo('url'); }

// changing the alt text on the logo to show your site name 
function plastical_login_title() { echo get_option('blogname'); }

// calling it only on the login page
add_action('login_head', 'plastical_login_css');
add_filter('login_headerurl', 'plastical_login_url');
add_filter('login_headertitle', 'plastical_login_title');


/************* CUSTOMIZE ADMIN *******************/

/*
I don't really reccomend editing the admin too much
as things may get funky if Wordpress updates. Here
are a few funtions which you can choose to use if 
you like.
*/

// Custom Backend Footer
function plastical_custom_admin_footer() {
	echo '<span id="footer-thankyou">Made by <a class="admin_link_to_plastical" href="http://plastical.com" target="_blank">Plastical</a></span>.';
}

// adding it to the admin area
add_filter('admin_footer_text', 'plastical_custom_admin_footer');

/* WP SEO */
# global
global $wpseo_admin;
# this removes when editing 'YOUR PROFILE'
remove_action( 'show_user_profile', array( $wpseo_admin, 'user_profile' ) );
# this removes when editing 'EDIT PROFILE'
remove_action( 'edit_user_profile', array( $wpseo_admin, 'user_profile' ) );

// Add the posts and pages columns filter. They can both use the same function.
add_filter('manage_posts_columns', 'add_post_thumbnail_column', 5);
add_filter('manage_pages_columns', 'add_post_thumbnail_column', 5);

// Add the column
function add_post_thumbnail_column($cols){
  $cols['post_thumb'] = __('Feat. image');
  return $cols;
}

// Hook into the posts an pages column managing. Sharing function callback again.
add_action('manage_posts_custom_column', 'display_post_thumbnail_column', 5, 2);
add_action('manage_pages_custom_column', 'display_post_thumbnail_column', 5, 2);

// Grab featured-thumbnail size post thumbnail and display it.
function display_post_thumbnail_column($col, $id){
  switch($col){
    case 'post_thumb':
      if( function_exists('the_post_thumbnail') )
        echo the_post_thumbnail( 'plastical-thumb-160' );
      else
        echo 'Not supported in theme';
      break;
  }
}

/** Hide Administrator From User List **/
function isa_pre_user_query($user_search) {
  $user = wp_get_current_user();
  if (!current_user_can('administrator')) { // Is Not Administrator - Remove Administrator
    global $wpdb;

    $user_search->query_where = 
        str_replace('WHERE 1=1', 
            "WHERE 1=1 AND {$wpdb->users}.ID IN (
                 SELECT {$wpdb->usermeta}.user_id FROM $wpdb->usermeta 
                    WHERE {$wpdb->usermeta}.meta_key = '{$wpdb->prefix}capabilities'
                    AND {$wpdb->usermeta}.meta_value NOT LIKE '%administrator%')", 
            $user_search->query_where
        );
  }
}
add_action('pre_user_query','isa_pre_user_query');

// hide menus to user subscribers
function hide_menus () {
global $menu;

if(current_user_can('subscriber')):
	$restricted = array(__('Posts'),__('Media'), __('Tools'), __('Comments'));
	end ($menu);
	while (prev($menu)){
		$value = explode(' ',$menu[key($menu)][0]);
		if(in_array($value[0] != NULL?$value[0]:"" , $restricted)){unset($menu[key($menu)]);}
	}
endif;
}
add_action('admin_menu', 'hide_menus');

function allow_subscriber_uploads() {
	$subscriber = get_role('subscriber');
	$subscriber->add_cap('upload_files');
}

if ( current_user_can('contributor') && !current_user_can('upload_files') )
	add_action('admin_init', 'allow_contributor_uploads');

function allow_contributor_uploads() {
	$contributor = get_role('contributor');
	$contributor->add_cap('upload_files');
}

function remove_admin_bar_links() {
	if(current_user_can('subscriber')) {
    global $wp_admin_bar;
    $wp_admin_bar->remove_menu('wp-logo');          // Remove the WordPress logo
    $wp_admin_bar->remove_menu('about');            // Remove the about WordPress link
    $wp_admin_bar->remove_menu('wporg');            // Remove the WordPress.org link
    $wp_admin_bar->remove_menu('documentation');    // Remove the WordPress documentation link
    $wp_admin_bar->remove_menu('support-forums');   // Remove the support forums link
    $wp_admin_bar->remove_menu('feedback');         // Remove the feedback link
    //$wp_admin_bar->remove_menu('site-name');        // Remove the site name menu
    //$wp_admin_bar->remove_menu('view-site');        // Remove the view site link
    $wp_admin_bar->remove_menu('updates');          // Remove the updates link
    $wp_admin_bar->remove_menu('comments');         // Remove the comments link
    $wp_admin_bar->remove_menu('new-content');      // Remove the content link
    $wp_admin_bar->remove_menu('w3tc');             // If you use w3 total cache remove the performance link
	$wp_admin_bar->remove_menu('wpseo-dashboard');             // If you use w3 total cache remove the performance link
    //$wp_admin_bar->remove_menu('my-account');       // Remove the user details tab
	}
}
add_action( 'wp_before_admin_bar_render', 'remove_admin_bar_links' );

if (!current_user_can(‘manage_options’)) { add_filter(‘show_admin_bar’, ‘__return_false’); }

function hide_yoastseo() {
if ( !current_user_can( 'administrator' ) ) :
    remove_action('admin_bar_menu', 'wpseo_admin_bar_menu',95);
    remove_menu_page('wpseo_dashboard');
endif;
}
add_action( 'admin_init', 'hide_yoastseo');

if ( current_user_can('subscriber') && !current_user_can('upload_files') )
	add_action('admin_init', 'allow_subscriber_uploads');

