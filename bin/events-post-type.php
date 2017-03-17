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
	wp_enqueue_style('functions-css', get_template_directory_uri() . CONFIG_THEME_DIR . '/events/events-functions.css');
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
		'menu_icon' => get_template_directory_uri() . CONFIG_THEME_DIR . '/events/event.png',
		'hierarchical' => false,
		'rewrite' => array('slug' => 'events', 'with_front' => false),
    'show_in_rest' => true,
    'rest_base' => 'events',
    'rest_controller_class' => 'WP_REST_Posts_Controller',
		'can_export' => true,
    	'_builtin' => false,
    	'_edit_link' => 'post.php?post=%d', // ?
   		'supports' => array('title','editor','thumbnail','sticky','excerpt','comments'),
		  'capability_type' => 'post',
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
  "col_ev_location" => __('Location'),
  "col_ev_desc" => __('Description'),
	"col_ev_featured" => __('Featured'),
	"col_ev_attendform" => __('Attend form'),
);
return $columns;
}
 
function events_custom_columns($column)
{
global $post;
$custom = get_post_custom();
switch ($column)
{
case "col_ev_attendform":
	echo ($custom["events_attendform"][0] == 'yes')?'*':'';
break;
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
case "col_ev_location";
    echo $custom["events_location"][0];
break;
case "col_ev_desc";
    the_excerpt();
break;
 
}
}

add_action( 'admin_init', 'events_create' );

function events_create() {
	add_meta_box('events_meta', __('Event date / featured'), 'events_meta', 'events', 'side', 'high');
  $screen = get_current_screen();
  if( 'add' != $screen->action ){
      add_meta_box(
          'events_display',
          __('Event attendees'),
          'events_display',
          'events'
      );
  } 
}

function events_display () {
  global $post;
  global $wpdb;
  $custom = get_post_custom($post->ID);
  $results = $wpdb->get_results(
    "SELECT created, last_name, first_name, email, job_title, company, address FROM plst_event_subscriptions 
    WHERE post_id = '$post->ID' ORDER BY last_name"
  );
  $result_count = $wpdb->get_var(
    "SELECT COUNT(*) FROM  plst_event_subscriptions 
    WHERE post_id = '$post->ID' ORDER BY last_name"
  );
  if(!empty ($results)){
  ?>
  <p>Attendees: <?php echo $result_count ?></p>
  <table class="wp-list-table widefat fixed striped posts">
    <thead>
      <tr>
        <th>
          <?php _e('Date') ?>
        </th>
        <th class="manage-column">
          <?php _e('Last name') ?>
        </th>
        <th class="manage-column">
          <?php _e('First name') ?>
        </th>
        <th class="manage-column">
          Email
        </th>
        <th class="manage-column">
          <?php _e('Job title') ?>
        </th>
        <th class="manage-column">
          <?php _e('Company') ?>
        </th>
        <th class="manage-column">
          <?php _e('Address') ?>
        </th>
      </tr>
    </thead>
    <tbody>
      <?php
        foreach ( $results as $result ) 
        {
          echo '<tr class="hentry">';
          echo '<td>' . $result->created . '</td>';
          echo '<td>' . $result->last_name . '</td>';
          echo '<td>' . $result->first_name . '</td>';
          echo '<td>' . $result->email . '</td>';
          echo '<td>' . $result->job_title . '</td>';
          echo '<td>' . $result->company . '</td>';
          echo '<td>' . $result->address . '</td>';
          echo '</tr>';
        } ?>
    </tbody>
  </table>

<?php
  }
}
 
function events_meta () {
 
// - grab data -
 
global $post;
$custom = get_post_custom($post->ID);
$meta_sd = $custom["events_startdate"][0];
$meta_ed = $custom["events_enddate"][0];
$meta_dd = $custom["events_deadlinedate"][0];
$meta_st = $meta_sd;
$meta_et = $meta_ed;
$meta_dt = $meta_dd;
$events_location = get_post_meta( $post->ID, 'events_location', true );
$events_featured = get_post_meta( $post->ID, 'events_featured', true );
$events_attendform = get_post_meta( $post->ID, 'events_attendform', true );

 
// - grab wp time format -
 
$date_format = get_option('date_format'); // Not required in my code
$time_format = get_option('time_format');
 
// - populate today if empty, 00:00 for time -
 
if ($meta_sd == null) { 
  $meta_sd = time(); 
  $meta_ed = $meta_sd; 
  $meta_dd = $meta_sd; 
  $meta_st = 0; 
  $meta_et = 0; 
  $meta_dt = 0;
}
 
// - convert to pretty formats -
 
$clean_sd = date("d.m.Y", $meta_sd);
$clean_ed = date("d.m.Y", $meta_ed);
$clean_dd = date("d.m.Y", $meta_dd);
$clean_st = date($time_format, $meta_st);
$clean_et = date($time_format, $meta_et);
$clean_dt = date($time_format, $meta_dt);
 
// - security -
 
echo '<input type="hidden" name="events-nonce" id="events-nonce" value="' . wp_create_nonce( 'events-nonce' ) . '" />';
 
// - output -
 
?>
<div class="events_meta">
  <ul>
    <li><label><?php _e('Start date') ?></label><input name="events_startdate" class="events_date" value="<?php echo $clean_sd; ?>" placeholder="<?php _e('DD.MM.YYYY') ?>"/></li>
    <li><label><?php _e('Start time') ?></label><input name="events_starttime" value="<?php echo $clean_st; ?>" placeholder="<?php _e('HH:MM') ?>"/></li>
    <li><label><?php _e('End date') ?></label><input name="events_enddate" class="events_date" value="<?php echo $clean_ed; ?>"  placeholder="<?php _e('DD.MM.YYYY') ?>"/></li>
    <li><label><?php _e('End time') ?></label><input name="events_endtime" value="<?php echo $clean_et; ?>" placeholder="<?php _e('HH:MM') ?>"/></li>
  </ul>
  <p>&nbsp;</p>
</div>
<div class="events_meta">
	<ul>
			<li><label><?php _e('Location') ?></label><input name="events_location" value="<?php echo $events_location; ?>" placeholder="<?php _e('Venue, City') ?>"/></li>
	</ul>
  <p>&nbsp;</p>
</div>
<div class="events_meta">
	<ul>
			<li><label><?php _e('Add form?') ?></label>
			<select name="events_attendform">
				<option value="no" <?php if(!isset($events_attendform) || $events_attendform == 'no'){ echo 'selected="selected"'; } ?>><?php _e('No') ?></option>
				<option value="yes" <?php if($events_attendform == 'yes'){ echo 'selected="selected"';}?>><?php _e('Yes') ?></option>
			</select>
			</li>
	</ul>
  <ul>
    <li><label><?php _e('Deadline date') ?></label><input name="events_deadlinedate" class="events_date" value="<?php echo $clean_dd; ?>"  placeholder="<?php _e('DD.MM.YYYY') ?>"/></li>
    <li><label><?php _e('Deadline time') ?></label><input name="events_deadlinetime" value="<?php echo $clean_dt; ?>" placeholder="<?php _e('HH:MM') ?>"/></li>
  </ul>
  <p>&nbsp;</p>
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
  <p>&nbsp;</p>
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

if(!isset($_POST["events_location"])):
return $post;
endif;
update_post_meta( $post->ID, 'events_location', strip_tags( $_POST['events_location'] ) );
 
if(!isset($_POST["events_featured"])):
return $post;
endif;
update_post_meta( $post->ID, 'events_featured', strip_tags( $_POST['events_featured'] ) );

if(!isset($_POST["events_attendform"])):
return $post;
endif;
update_post_meta( $post->ID, 'events_attendform', strip_tags( $_POST['events_attendform'] ) );

if(!isset($_POST["events_deadlinedate"])):
return $post;
endif;
$updatedeadd = strtotime ( $_POST["events_deadlinedate"] . $_POST["events_deadlinetime"]);
update_post_meta($post->ID, "events_deadlinedate", $updatedeadd );

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

/**
* Add REST API support to an already registered post type.
*/
function events_rest_support() {
  global $wp_post_types;
  
	//be sure to set this to the name of your post type!
  $post_type_name = 'events';
  if(isset( $wp_post_types[ $post_type_name ])) {
  	$wp_post_types[$post_type_name]->show_in_rest = true;
  	$wp_post_types[$post_type_name]->rest_base = $post_type_name;
  	$wp_post_types[$post_type_name]->rest_controller_class = 'WP_REST_Posts_Controller';
  }
}
add_action('init', 'events_rest_support', 25);

//function get_user_meta($object, $field_name, $request) {
function get_events_meta_startdate($object) { // no need to call a single field_name
  return date('d.m.Y H:i', get_post_meta($object['id'], 'events_startdate', true));
}
function get_events_meta_startdate_iso($object) { // no need to call a single field_name
  return date('c', get_post_meta($object['id'], 'events_startdate', true));
}
function get_events_meta_enddate($object) { // no need to call a single field_name
  return date('d.m.Y H:i', get_post_meta($object['id'], 'events_enddate', true));
}
function get_events_meta_enddate_iso($object) { // no need to call a single field_name
  return date('c', get_post_meta($object['id'], 'events_enddate', true));
}
function get_events_meta_location($object) { // no need to call a single field_name
  return get_post_meta($object['id'], 'events_location', true);
}
function get_events_meta_featured($object) { // no need to call a single field_name
  return get_post_meta($object['id'], 'events_featured', true);
}
function get_events_meta_attendform($object) { // no need to call a single field_name
  return get_post_meta($object['id'], 'events_attendform', true);
}
function get_events_meta_deadlinedate($object) { // no need to call a single field_name
  return date('d.m.Y H:i', get_post_meta($object['id'], 'events_deadlinedate', true));
}
function get_events_meta_deadlinedate_comp($object) { // no need to call a single field_name
  return get_post_meta($object['id'], 'events_deadlinedate', true);
}

function register_events_meta_rest() {
  register_rest_field('events', 'events_startdate', [
      'get_callback'    => 'get_events_meta_startdate',
      'update_callback' => 'null',
      'schema'          => 'null',
  ]);
  register_rest_field('events', 'events_startdate_iso', [
      'get_callback'    => 'get_events_meta_startdate_iso',
      'update_callback' => 'null',
      'schema'          => 'null',
  ]);
  register_rest_field('events', 'events_enddate', [
      'get_callback'    => 'get_events_meta_enddate',
      'update_callback' => 'null',
      'schema'          => 'null',
  ]);
  register_rest_field('events', 'events_enddate_iso', [
      'get_callback'    => 'get_events_meta_enddate_iso',
      'update_callback' => 'null',
      'schema'          => 'null',
  ]);
  register_rest_field('events', 'events_location', [
      'get_callback'    => 'get_events_meta_location',
      'update_callback' => 'null',
      'schema'          => 'null',
  ]);
  register_rest_field('events', 'events_featured', [
      'get_callback'    => 'get_events_meta_featured',
      'update_callback' => 'null',
      'schema'          => 'null',
  ]);
  register_rest_field('events', 'events_attendform', [
      'get_callback'    => 'get_events_meta_attendform',
      'update_callback' => 'null',
      'schema'          => 'null',
  ]);
  register_rest_field('events', 'events_deadlinedate', [
      'get_callback'    => 'get_events_meta_deadlinedate',
      'update_callback' => 'null',
      'schema'          => 'null',
  ]);
  register_rest_field('events', 'events_deadlinedate_comp', [
      'get_callback'    => 'get_events_meta_deadlinedate_comp',
      'update_callback' => 'null',
      'schema'          => 'null',
  ]);
}
add_action('rest_api_init', 'register_events_meta_rest');

/** so here's an example of the possible event's query...
*
* https://localhost/wp-json/wp/v2/events
* ?order=asc
* &filter[orderby]=meta_value
* &filter[meta_key]=events_startdate
* &filter[meta_query][key]=events_enddate
* &filter[meta_query][compare]='>='
* &filter[meta_query][value]=milliseconds
*
*/

function events_collection_params($params, $post_type_obj = null) {
	$params['order'] = array(
		'description'        => __( 'Order sort attribute ascending or descending.' ),
		'type'               => 'string',
		'default'            => 'asc',
		'enum'               => array( 'asc', 'desc', 'ASC', 'DESC' ),
	);

	$params['orderby'] = array(
		'description'        => __( 'Sort collection by object attribute.' ),
		'type'               => 'string',
		'default'            => 'date',
		'enum'               => array(
			'date',
			'relevance',
			'id',
			'include',
			'title',
			'slug',
      'meta_value',
			'meta_value_num',
			'menu_order title',
			'menu_order',
			'data'
		),
	);

	return $params;
}
add_filter( 'rest_events_collection_params', 'events_collection_params', 10, 2);

function events_query( $args, $request ) {
  if(isset($request['forthcoming'])) {
    $args['meta_query'] = array(
    		'compare' => '>=',
    		'key'		=> 'events_startdate',
    		'value'	=> time()
    	);
  }
  if(isset($request['past'])) {
    $args['meta_query'] = array(
    		'compare' => '<',
    		'key'		=> 'events_enddate',
    		'value'	=> time()
    	);
  }
  if(isset($request['feat_forthcoming'])){
    $args['meta_query'] = array(
        array(
    		'compare' => '>=',
    		'key'		=> 'events_startdate',
    		'value'	=> time()
        ),
        array(
        'compare' => '=',
    		'key'		=> 'events_featured',
    		'value'	=> 'yes'
        )
    	);
  }
   /* if(isset($request['filter']['tax_query'])) {
    	$tax_query = array();
    	foreach ($request['filter']['tax_query'] as $query) {
    		$tax_query[] =array(
    			'taxonomy' 	=> $query['taxonomy'],
    			'field'		=> $query['field'],
    			'terms'		=> $query['terms'],
    			'operator'	=> $query['operator']
    		);
    	}
	    $args['tax_query'] = $tax_query;
    }
    if(isset($request['filter']['product_cat'])) {
    	$args['product_cat'] = $request['filter']['product_cat'];
    }
    if(isset($request['filter']['meta_key'])) {
    	$args['meta_key'] = $request['filter']['meta_key'];
    }
  */
    if(isset($request['meta_key'])) {
    	$args['meta_key'] = $request['meta_key'];
    }

    return $args;
}
add_filter( 'rest_events_query', 'events_query' ,10 ,2 );