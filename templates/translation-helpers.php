<td colspan="2" class="translation-helpers">
	<div class="helpers-content">
	<h3>More info</h3>
	<nav>
		<ul class="helpers-tabs">
			<?php
			$is_first_class = 'current';
			foreach ( $sections as $section ) {
				// TODO: printf.
				$loading_class = $section['has_async_content'] ? 'loading' : '';
				echo "<li class='{$is_first_class} {$loading_class}' data-tab='{$section['id']}'>" . esc_html( $section['title'] ) . '</li>'; // WPCS: XSS OK.
				$is_first_class = '';
			}
			?>
		</ul>
	</nav>
	<?php
	$is_first_class = 'current';
	foreach ( $sections as $section ) {
		printf( '<div class="%s helper %s" id="%s">', esc_attr( $section['classname'] ), esc_attr( $is_first_class ), esc_attr( $section['id'] ) );
		echo $section['content'];
		echo '</div>';
		$is_first_class = '';
	}
	?>
	</div>
</td>
