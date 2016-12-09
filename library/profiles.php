<?php 

/**
 * Ovverides the number of posts of every user. This is needed in order to display
 * All the subscribers (aka the lowest members of the site)
*/
function custom_get_usernumposts($count, $userid, $post_type, $public_only) {
  return 1;
}
add_filter('get_usernumposts' , 'custom_get_usernumposts');

//function get_user_meta($object, $field_name, $request) {
function get_user_meta_street($user) { // no need to call a single field_name
  return get_user_meta($user['id'], 'street', true);
}
function get_user_meta_city($user) { // no need to call a single field_name
  return get_user_meta($user['id'], 'city', true);
}
function get_user_meta_facebook($user) { // no need to call a single field_name
  return get_user_meta($user['id'], 'facebook', true);
}

function register_user_meta_rest() {
  register_rest_field('user', 'street', [
      'get_callback'    => 'get_user_meta_street',
      'update_callback' => 'null',
      'schema'          => 'null',
  ]);
  register_rest_field('user', 'city', [
      'get_callback'    => 'get_user_meta_city',
      'update_callback' => 'null',
      'schema'          => 'null',
  ]);
  register_rest_field('user', 'facebook', [
      'get_callback'    => 'get_user_meta_facebook',
      'update_callback' => 'null',
      'schema'          => 'null',
  ]);
}
add_action('rest_api_init', 'register_user_meta_rest');

if(is_admin()){
  remove_action("admin_color_scheme_picker", "admin_color_scheme_picker");
  //add_action( 'personal_options', 'ozh_personal_options');
}
if (!current_user_can('manage_options')) {
    add_filter('show_admin_bar', '__return_false');
}

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
    $author_slug = 'u'; // change slug name
    $wp_rewrite->author_base = $author_slug;
}

add_filter('user_search_columns', 'user_search_columns_bd' , 10, 3);

function user_search_columns_bd($search_columns, $search, $this){

    if(!in_array('display_name', $search_columns)){
        $search_columns[] = 'display_name';
    }
    return $search_columns;
}

// add query variable for filtering users
function add_query_vars_filter( $vars ){
  $vars[] = "f";
  return $vars;
}
add_filter( 'query_vars', 'add_query_vars_filter' );