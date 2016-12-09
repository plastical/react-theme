<?php
/**
 * The header for our theme.
 *
 * This is the template that displays all of the <head> section and everything up until <div id="content">
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package Plastical
 */

?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">

<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<div id="page" class="site">
	<a class="skip_link screen_reader_text" href="#content"><?php esc_html_e('Skip to content', 'plastical'); ?></a>

	<header id="masthead" class="site_header" role="banner">
		<div class="site_branding">
			<h1 class="site_title"><a href="<?php echo esc_url(home_url('/')); ?>" rel="home"><?php bloginfo('name'); ?></a></h1>
		</div><!-- .site-branding -->

		<nav id="site-navigation" class="main_navigation" role="navigation" aria-live="assertive"></nav><!-- #site-navigation -->
	</header><!-- #masthead -->

	<div id="content" class="site_content">
