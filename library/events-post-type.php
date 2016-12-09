<?php

function add_event_caps() {
$role = get_role( 'administrator' );

$role->add_cap( 'edit_event' ); 
$role->add_cap( 'edit_events' ); 
$role->add_cap( 'edit_others_events' ); 
$role->add_cap( 'publish_events' ); 
$role->add_cap( 'read_event' ); 
$role->add_cap( 'read_private_events' ); 
$role->add_cap( 'delete_event' ); 
$role->add_cap( 'edit_published_events' );
$role->add_cap( 'delete_published_events' );
}
add_action('admin_init', 'add_event_caps');

add_action('admin_init', 'event_functions_css');

function event_functions_css() {
	wp_enqueue_style('functions-css', '/assets/css/events/events-functions.css');
}

add_action('init', 'event_register');
function event_register() {

	$labels = array(
		'name' => _x('Events', 'post type general name'),
		'singular_name' => _x('Event', 'post type singular name'),
		'add_new' => _x('Add event', 'event'),
		'add_new_item' => __('New event'),
		'edit_item' => __('Edit event'),
		'new_item' => __('New event'),
		'view_item' => __('Show event'),
		'search_items' => __('Search events'),
		'not_found' =>  __('Not found'),
		'not_found_in_trash' => __('Not found in trash'),
		'parent_item_colon' => ''
	);

	$args = array(
		'labels' => $labels,
		'public' => true,
		'publicly_queryable' => true,
		'show_ui' => true,
		'query_var' => true,
		'rewrite' => true,
		'capability_type' => 'post',
		'menu_position' => 5, /* this is what order you want it to appear in on the left hand side menu */ 
		'menu_icon' => '/assets/icons/event.png',
		'hierarchical' => false,
		'rewrite' => array('slug' => 'events', 'with_front' => false),
    'show_in_rest' => true,
    'rest_base' => 'events',
    'rest_controller_class' => 'WP_REST_Posts_Controller',
		'can_export' => true,
    	'_builtin' => false,
    	'_edit_link' => 'post.php?post=%d', // ?
   		'supports' => array('title','editor','thumbnail','sticky','excerpt','comments'),
		'capability_type' => 'event',
		'capabilities' => array(
			'read_post' => 'read_event',
			'publish_posts' => 'publish_events',
			'edit_posts' => 'edit_events',
			'edit_others_posts' => 'edit_others_events',
			'delete_posts' => 'delete_events',
			'delete_others_posts' => 'delete_others_events',
			'read_private_posts' => 'read_private_events',
			'edit_post' => 'edit_event',
			'delete_post' => 'delete_event',
	
			),
		'map_meta_cap' => true
	  );

	register_post_type('events' , $args);
}

add_action('manage_posts_custom_column',  'events_custom_columns');
add_filter('manage_events_posts_columns', 'events_edit_columns');

function events_edit_columns($columns) {
 
$columns = array(
  "cb" => "<input type=\"checkbox\" />",
  "title" => __('Event'),
  "col_ev_date" => __('Date'),
  "col_ev_times" => __('Times'),
  "col_ev_desc" => __('Description'),
	"col_ev_featured" => __('Featured'),
);
return $columns;
}
 
function events_custom_columns($column)
{
global $post;
$custom = get_post_custom();
switch ($column)
{
case "col_ev_featured":
	echo ($custom["events_featured"][0] == 'yes')?'*':'';
break;
case "col_ev_date":
    // - show dates -
    $startd = $custom["events_startdate"][0];
    $endd = $custom["events_enddate"][0];
    $startdate = date("d.m.Y", $startd);
    $enddate = date("d.m.Y", $endd);
    echo $startdate . '<br /><em>' . $enddate . '</em>';
break;
case "col_ev_times":
    // - show times -
    $startt = $custom["events_startdate"][0];
    $endt = $custom["events_enddate"][0];
    $time_format = get_option('time_format');
    $starttime = date($time_format, $startt);
    $endtime = date($time_format, $endt);
    echo $starttime . ' - ' .$endtime;
break;
case "col_ev_desc";
    the_excerpt();
break;
 
}
}

add_action( 'admin_init', 'events_create' );

function events_create() {
	add_meta_box('events_meta', __('Event date / featured'), 'events_meta', 'events', 'side', 'high');
}
 
function events_meta () {
 
// - grab data -
 
global $post;
$custom = get_post_custom($post->ID);
$meta_sd = $custom["events_startdate"][0];
$meta_ed = $custom["events_enddate"][0];
$meta_st = $meta_sd;
$meta_et = $meta_ed;
$events_featured = get_post_meta( $post->ID, 'events_featured', true );

 
// - grab wp time format -
 
$date_format = get_option('date_format'); // Not required in my code
$time_format = get_option('time_format');
 
// - populate today if empty, 00:00 for time -
 
if ($meta_sd == null) { $meta_sd = time(); $meta_ed = $meta_sd; $meta_st = 0; $meta_et = 0;}
 
// - convert to pretty formats -
 
$clean_sd = date("d.m.Y", $meta_sd);
$clean_ed = date("d.m.Y", $meta_ed);
$clean_st = date($time_format, $meta_st);
$clean_et = date($time_format, $meta_et);
 
// - security -
 
echo '<input type="hidden" name="events-nonce" id="events-nonce" value="' . wp_create_nonce( 'events-nonce' ) . '" />';
 
// - output -
 
?>
<div class="events_meta">
<ul>
    <li><label><?php _e('Start date') ?></label><input name="events_startdate" class="events_date" value="<?php echo $clean_sd; ?>" placeholder="<?php _e('DD.MM.YYYY') ?>"/></li>
    <li><label><?php _e('Start time') ?></label><input name="events_starttime" value="<?php echo $clean_st; ?>" placeholder="<?php _e('HH:MM') ?>"/></li>
    <li><label><?php _e('End date') ?></label><input name="events_enddate" class="events_date" value="<?php echo $clean_ed; ?>"  placeholder="<?php _e('DD.MM.YYYY') ?>"/></li>
    <li><label><?php _e('Edn time') ?></label><input name="events_endtime" value="<?php echo $clean_et; ?>" placeholder="<?php _e('HH:MM') ?>"/></li>
</ul>
</div>
<div class="events_meta">
		<ul>
			<li><label><?php _e('Featured?') ?></label>
			<select name="events_featured">
				<option value="no" <?php if(!isset($events_featured) || $events_featured == 'no'){ echo 'selected="selected"'; } ?>><?php _e('No') ?></option>
				<option value="yes" <?php if($events_featured == 'yes'){ echo 'selected="selected"';}?>><?php _e('Yes') ?></option>
			</select>
			</li>
		</ul>
	</div>
<?php
}

add_action ('save_post', 'save_events');
 
function save_events(){
 
global $post;
 
// - still require nonce
 
if ( !wp_verify_nonce( $_POST['events-nonce'], 'events-nonce' )) {
    return $post->ID;
}
 
if ( !current_user_can( 'edit_post', $post->ID ))
    return $post->ID;
 
// - convert back to unix & update post
 
if(!isset($_POST["events_startdate"])):
return $post;
endif;
$updatestartd = strtotime ( $_POST["events_startdate"] . $_POST["events_starttime"] );
update_post_meta($post->ID, "events_startdate", $updatestartd );
 
if(!isset($_POST["events_enddate"])):
return $post;
endif;
$updateendd = strtotime ( $_POST["events_enddate"] . $_POST["events_endtime"]);
update_post_meta($post->ID, "events_enddate", $updateendd );
 
 
if(!isset($_POST["events_featured"])):
return $post;
endif;
update_post_meta( $post->ID, 'events_featured', strip_tags( $_POST['events_featured'] ) );

}

add_filter('post_updated_messages', 'events_updated_messages');
 
function events_updated_messages( $messages ) {
 
  global $post, $post_ID;
 
  $messages['events'] = array(
    0 => '', // Unused. Messages start at index 1.
    1 => sprintf( __('Event updated. <a href="%s">View item</a>'), esc_url( get_permalink($post_ID) ) ),
    2 => __('Custom field updated.'),
    3 => __('Custom field deleted.'),
    4 => __('Event updated.'),
    /* translators: %s: date and time of the revision */
    5 => isset($_GET['revision']) ? sprintf( __('Event restored to revision from %s'), wp_post_revision_title( (int) $_GET['revision'], false ) ) : false,
    6 => sprintf( __('Event published. <a href="%s">View event</a>'), esc_url( get_permalink($post_ID) ) ),
    7 => __('Event saved.'),
    8 => sprintf( __('Event submitted. <a target="_blank" href="%s">Preview event</a>'), esc_url( add_query_arg( 'preview', 'true', get_permalink($post_ID) ) ) ),
    9 => sprintf( __('Event scheduled for: <strong>%1$s</strong>. <a target="_blank" href="%2$s">Preview event</a>'),
      // translators: Publish box date format, see http://php.net/date
      date_i18n( __( 'M j, Y @ G:i' ), strtotime( $post->post_date ) ), esc_url( get_permalink($post_ID) ) ),
    10 => sprintf( __('Event draft updated. <a target="_blank" href="%s">Preview event</a>'), esc_url( add_query_arg( 'preview', 'true', get_permalink($post_ID) ) ) ),
  );
 
  return $messages;
}

function events_styles() {
    global $post_type;
    if( 'events' != $post_type )
        return;
    wp_enqueue_style('ui-datepicker', '/assets/css/events/jquery-ui-1.8.9.custom.css');
}
 
function events_scripts() {
    global $post_type;
    if( 'events' != $post_type )
        return;
    wp_enqueue_script('jquery-ui', '/assets/js/libs/events/jquery-ui-1.8.9.custom.min.js', array('jquery'));
    wp_enqueue_script('ui-datepicker', '/assets/js/libs/events/jquery.ui.datepicker.js');
    wp_enqueue_script('custom_script', '/assets/js/libs/events/pubforce-admin.js', array('jquery'));
}
 
//add_action( 'admin_print_styles-post.php', 'events_styles', 1000 );
//add_action( 'admin_print_styles-post-new.php', 'events_styles', 1000 );
 
//add_action( 'admin_print_scripts-post.php', 'events_scripts', 1000 );
//add_action( 'admin_print_scripts-post-new.php', 'events_scripts', 1000 );

/**
* Add REST API support to an already registered post type.
*/
add_action('init', 'event_rest_support', 25);
  function event_rest_support() {
  	global $wp_post_types;
  
  	//be sure to set this to the name of your post type!
  	$post_type_name = 'events';
  	if(isset( $wp_post_types[ $post_type_name ])) {
  		$wp_post_types[$post_type_name]->show_in_rest = true;
  		$wp_post_types[$post_type_name]->rest_base = $post_type_name;
  		$wp_post_types[$post_type_name]->rest_controller_class = 'WP_REST_Posts_Controller';
  	}
}

//function get_user_meta($object, $field_name, $request) {
function get_event_meta_startdate($object) { // no need to call a single field_name
  return get_post_meta($object['id'], 'events_startdate', true);
}
function get_event_meta_enddate($object) { // no need to call a single field_name
  return get_post_meta($object['id'], 'events_enddate', true);
}
function get_event_meta_featured($object) { // no need to call a single field_name
  return get_post_meta($object['id'], 'events_featured', true);
}

function register_event_meta_rest() {
  register_rest_field('events', 'events_startdate', [
      'get_callback'    => 'get_event_meta_startdate',
      'update_callback' => 'null',
      'schema'          => 'null',
  ]);
  register_rest_field('events', 'events_enddate', [
      'get_callback'    => 'get_event_meta_enddate',
      'update_callback' => 'null',
      'schema'          => 'null',
  ]);
  register_rest_field('events', 'events_featured', [
      'get_callback'    => 'get_event_meta_featured',
      'update_callback' => 'null',
      'schema'          => 'null',
  ]);
}
add_action('rest_api_init', 'register_event_meta_rest');
