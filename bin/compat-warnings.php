<?php
/**
 * Plastical compatibility warnings
 *
 * Prevents Plastical from running on WordPress versions without the REST API,
 * since this theme requires API functionality. If this file is loaded,
 * we know we have an incompatible WordPress.
 *
 * @package Plastical
 */

/**
 * Prevent switching to Plastical on old versions of WordPress.
 *
 * Switches to the default theme.
 */
function plastical_switch_theme() {
	switch_theme(WP_DEFAULT_THEME);
	unset($_GET['activated']);
	add_action('admin_notices', 'plastical_upgrade_notice');
}
add_action('after_switch_theme', 'plastical_switch_theme');

/**
 * Adds a message for unsuccessful theme switch.
 *
 * Prints an update nag after an unsuccessful attempt to switch to
 * Plastical on WordPress versions prior to 4.7.
 *
 * @global string $wp_version WordPress version.
 */
function plastical_upgrade_notice() {
	$message = __('Plastical requires the REST API plugin. Please install the plugin and try again.', 'plastical');
	printf('<div class="error"><p>%s</p></div>', $message); /* WPCS: xss ok. */
}

/**
 * Prevents the Customizer from being loaded on WordPress versions prior to 4.7.
 *
 * @since Plastical 1.0
 *
 * @global string $wp_version WordPress version.
 */
function plastical_customize() {
	wp_die(__('Plastical requires the REST API plugin. Please install the plugin and try again.', 'plastical'), '', array(
		'back_link' => true,
	));
}
add_action('load-customize.php', 'plastical_customize');

/**
 * Prevents the Theme Preview from being loaded on WordPress versions prior to 4.7.
 *
 * @since Plastical 1.0
 *
 * @global string $wp_version WordPress version.
 */
function plastical_preview() {
	if (isset($_GET['preview'])) {
		wp_die(__('Plastical requires the REST API plugin. Please install the plugin and try again.', 'plastical'));
	}
}
add_action('template_redirect', 'plastical_preview');
