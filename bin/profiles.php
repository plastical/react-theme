<?php 

/**
 * Ovverides the number of posts of every user. This is needed in order to display
 * All the subscribers (aka the lowest members of the site)
*/
function custom_get_usernumposts($count, $userid, $post_type, $public_only) {
  return 1;
}
//add_filter('get_usernumposts' , 'custom_get_usernumposts');

//if(is_admin()){
  remove_action("admin_color_scheme_picker", "admin_color_scheme_picker");
  //add_action( 'personal_options', 'ozh_personal_options');
//}
//if (!current_user_can('manage_options')) {
    add_filter('show_admin_bar', '__return_false');
//}

global $sitepress; // if needed
remove_action('show_user_profile', array($sitepress, 'show_user_options'));

//if ( !current_user_can( 'administrator' ) ) {
add_action('admin_head','hide_personal_options');
function hide_personal_options(){
echo "\n" . '<script type="text/javascript">jQuery(document).ready(function($) { $(\'form#your-profile > h3:first\').hide(); $(\'form#your-profile > table:first\').hide(); $(\'form#your-profile\').show(); });</script>' . "\n";

}
//}

// change the author_base name
add_action('init', 'cng_author_base');
function cng_author_base() {
    global $wp_rewrite;
    $author_slug = 'user'; // change slug name
    $wp_rewrite->author_base = $author_slug;
}

add_filter('user_search_columns', 'user_search_columns_bd' , 10, 3);

function user_search_columns_bd($search_columns, $search, $this){

    if(!in_array('display_name', $search_columns)){
        $search_columns[] = 'display_name';
    }
    return $search_columns;
}

function user_collection_params($params, $post_type_obj = null) {
	$params['order'] = array(
		'description'        => __( 'Order sort attribute ascending or descending.' ),
		'type'               => 'string',
		'default'            => 'asc',
		'enum'               => array( 'asc', 'desc', 'ASC', 'DESC' ),
	);

	$params['orderby'] = array(
		'description'        => __( 'Sort collection by object attribute.' ),
		'type'               => 'string',
		'default'            => 'display_name',
		'enum'               => array(
			'date',
			'relevance',
			'id',
			'include',
			'display_name',
      'city',
      'current_status',
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
add_filter( 'rest_user_collection_params', 'user_collection_params', 10, 2);

function user_query( $args, $request ) {
  unset($args['has_published_posts']); // Show all users!
  unset($args['avatar_urls']);
  
  if(isset($request['city'])) {
    $args['meta_query'] = array(
      array(
    		'compare' => '=',
    		'key'		=> 'city',
    		'value'	=> $request['city']
    	), array(
    		'compare' => '!=',
    		'key'		=> 'current_status',
    		'value'	=> 'alumni'
    	)
    );
  }
  if(isset($request['current_status'])) {
    $args['meta_query'] = array(
    		'compare' => '=',
    		'key'		=> 'current_status',
    		'value'	=> $request['current_status']
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
add_filter('rest_user_query', 'user_query', 10 , 2);

//function get_user_meta($object, $field_name, $request) {
function get_user_meta_rest($user) { // no need to call a single field_name

  $user_data = get_userdata($user['id']); // get user data from author ID.

  $array_data = (array)($user_data->data); // object to array conversion.

  $array_data['nicename'] = get_the_author_meta('nicename', $user['id']);
  $array_data['street'] = get_user_meta($user['id'], 'street', true);
  $array_data['postal_code'] = get_user_meta($user['id'], 'postal_code', true);
  $array_data['city'] = get_user_meta($user['id'], 'city', true);
  $array_data['phone'] = get_user_meta($user['id'], 'phone', true);
  $array_data['contact_email'] = get_user_meta($user['id'], 'contact_email', true);
  $array_data['facebook'] = get_user_meta($user['id'], 'facebook', true);
  $array_data['twitter'] = get_user_meta($user['id'], 'twitter', true);
  $array_data['linkedin'] = get_user_meta($user['id'], 'linkedin', true);
  $array_data['googleplus'] = get_user_meta($user['id'], 'googleplus', true);
  $array_data['github'] = get_user_meta($user['id'], 'github', true);
  $array_data['current_status'] = get_user_meta($user['id'], 'current_status', true);
  $array_data['joined'] = get_user_meta($user['id'], 'joined', true);
  $array_data['left'] = get_user_meta($user['id'], 'left', true);
  $array_data['industry'] = get_user_meta($user['id'], 'industry', true);
  $array_data['founded'] = get_user_meta($user['id'], 'founded', true);
  $array_data['founders'] = get_user_meta($user['id'], 'founders', true);
  $array_data['team'] = get_user_meta($user['id'], 'team', true);
  $array_data['descr_en'] = wpautop(esc_attr(get_user_meta($user['id'], 'descr_en', true)));
  $array_data['descr_it'] = wpautop(esc_attr(get_user_meta($user['id'], 'descr_it', true)));
  $array_data['awards'] = get_user_meta($user['id'], 'awards', true);
  $array_data['funds_rised'] = get_user_meta($user['id'], 'funds_rised', true);
  $array_data['avatar'] = get_user_meta($user['id'], 'avatar', true);
  $array_data['file_1'] = get_user_meta($user['id'], 'file_1', true);
  $array_data['file_2'] = get_user_meta($user['id'], 'file_2', true);
  $array_data['file_3'] = get_user_meta($user['id'], 'file_3', true);
  $array_data['file_4'] = get_user_meta($user['id'], 'file_4', true);
  $array_data['file_5'] = get_user_meta($user['id'], 'file_5', true);
  // prevent user enumeration.
    unset($array_data['user_login']);
    unset($array_data['user_pass']);
    unset($array_data['user_activation_key']);
    unset($array_data['avatar_urls']);
  return array_filter($array_data);
}

function register_user_meta_rest() {
  register_rest_field('user', 'meta', [
      'get_callback'    => 'get_user_meta_rest',
      'update_callback' => 'null',
      'schema'          => 'null',
  ]);
}
add_action('rest_api_init', 'register_user_meta_rest');
