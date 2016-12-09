<?php
/**
 * The sidebar containing the main widget area.
 *
 * @package Plastical
 */

if ( ! is_active_sidebar( 'main-sidebar' ) ) {
	return;
}
?>

<div id="secondary" class="widget_area sidebar_widgets" role="complementary">
	<?php dynamic_sidebar( 'main-sidebar' ); ?>
</div><!-- #secondary -->
