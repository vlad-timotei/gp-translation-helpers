( function( $, $gp ) {
	// eslint-disable-next-line no-undef
	$( document ).ready(
		function() {
			var rowIds = '';
			var feedbackForm = '<details><summary class="feedback-summary">Give feedback</summary>' +
			'<div id="feedback-form">' +
			'<form>' +
			'<h3 class="feedback-reason-title">Reason</h3>' +
			'<ul class="feedback-reason-list">' +
			'<li><label><input type="checkbox" name="feedback_reason" value="style" />Style Guide</label></li>' +
			'<li><label><input type="checkbox" name="feedback_reason" value="grammar" />Grammar</label></li>' +
			'<li><label><input type="checkbox" name="feedback_reason" value="branding" />Branding</label></li>' +
			'<li><label><input type="checkbox" name="feedback_reason" value="glossary" />Glossary</label></li>' +
			'<li><label><input type="checkbox" name="feedback_reason" value="punctuation" />Punctuation</label></li>' +
			'<li><label><input type="checkbox" name="feedback_reason" value="typo" />Typo</label></li></ul>' +
			'<div class="feedback-comment">' +
				'<label>Comment </label>' +
				'<textarea name="feedback_comment"></textarea>' +
			'</div>' +
			'</form>' +
			'</div>' +
			'</details>';

			var modalFeedbackForm =
			'<div id="reject-feedback-form" style="display:none;">' +
			'<form>' +
			'<h3>Reason</h3>' +
			'<div class="modal-item"><label><input type="checkbox" name="modal_feedback_reason" value="style" />Style Guide </div></label>' +
			'<div class="modal-item"><label><input type="checkbox" name="modal_feedback_reason" value="grammar" />Grammar </div></label>' +
			'<div class="modal-item"><label><input type="checkbox" name="modal_feedback_reason" value="branding" />Branding </div></label>' +
			'<div class="modal-item"><label><input type="checkbox" name="modal_feedback_reason" value="glossary" />Glossary </div></label>' +
			'<div class="modal-item"><label><input type="checkbox" name="modal_feedback_reason" value="punctuation" />Punctuation </div></label>' +
			'<div class="modal-item"><label><input type="checkbox" name="modal_feedback_reason" value="typo" />Typo </div></label>' +
			'<div class="modal-comment">' +
					'<label>Comment </label>' +
					'<textarea name="modal_feedback_comment"></textarea>' +
			'</div>' +
			'<button id="modal-reject-btn" class="modal-btn">Reject</button>' +
			'</form>' +
			'</div>';

			$( 'body' ).append( modalFeedbackForm );

			// Remove click event added to <summary> by wporg-gp-customizations plugin
			$( $gp.editor.table ).off( 'click', 'summary' );

			$( '.meta' ).prepend( feedbackForm );

			$( '#bulk-actions-toolbar-top .button' ).click( function( e ) {
				rowIds = $( 'input:checked', $( 'table#translations th.checkbox' ) ).map( function() {
					return $( this ).parents( 'tr.preview' ).attr( 'row' );
				} ).get().join( ',' );
				if ( $( 'select[name="bulk[action]"]' ).val() === 'reject' ) {
					e.preventDefault();
					e.stopImmediatePropagation();
					// eslint-disable-next-line no-undef
					tb_show( 'Reject with Feedback', '#TB_inline?inlineId=reject-feedback-form' );
				}
			} );

			$( 'body' ).on( 'click', '#modal-reject-btn', function( e ) {
				e.preventDefault();
				bulkRejectWithFeedBack( rowIds );
			} );
		}
	);

	$gp.editor.hooks.set_status_rejected = function() {
		var button = $( this );
		var status = 'rejected';
		rejectWithFeedback( button, status );
	};

	function bulkRejectWithFeedBack( rowIds ) {
		var rowIdsArray = rowIds.split( ',' );

		var originalIds = rowIdsArray.map( function( rowId ) {
			return $gp.editor.original_id_from_row_id( rowId );
		} );
		var translationIds = rowIdsArray.map( function( rowId ) {
			return $gp.editor.translation_id_from_row_id( rowId );
		} );

		// $( 'form.filters-toolbar.bulk-actions' ).submit();
		var comment = '';
		var rejectReason = [];
		var rejectData = {};
		var data = {};

		$( 'input[name="modal_feedback_reason"]:checked' ).each(
			function() {
				rejectReason.push( this.value );
			}
		);

		comment = $( 'textarea[name="modal_feedback_comment"]' ).val();
		// eslint-disable-next-line no-undef
		rejectData.locale_slug = $gp_reject_feedback_settings.locale_slug;
		rejectData.reason = rejectReason;
		rejectData.comment = comment;
		rejectData.original_id = originalIds;
		rejectData.translation_id = translationIds;
		rejectData.is_bulk_reject = true;

		data = {
			action: 'reject_with_feedback',
			data: rejectData,
			// eslint-disable-next-line no-undef
			_ajax_nonce: $gp_reject_feedback_settings.nonce,
		};

		$.ajax(
			{
				type: 'POST',
				// eslint-disable-next-line no-undef
				url: $gp_reject_feedback_settings.url,
				data: data,
			}
		).done(
			function() {
				$( 'form.filters-toolbar.bulk-actions' ).submit();
			}
		);
	}

	function rejectWithFeedback( button, status ) {
		var comment = '';
		var rejectReason = [];
		var rejectData = {};
		var data = {};
		var div = button.closest( 'div.meta' );

		div.find( 'input[name="feedback_reason"]:checked' ).each(
			function() {
				rejectReason.push( this.value );
			}
		);

		comment = div.find( 'textarea[name="feedback_comment"]' ).val();

		if ( ! comment.trim().length && ! rejectReason.length ) {
			// No need to send the feedback.
			$gp.editor.set_status( button, status );
			return;
		}

		// eslint-disable-next-line no-undef
		rejectData.locale_slug = $gp_reject_feedback_settings.locale_slug;
		rejectData.reason = rejectReason;
		rejectData.comment = comment;
		rejectData.original_id = $gp.editor.current.original_id;
		rejectData.translation_id = $gp.editor.current.translation_id;
		rejectData.is_bulk_reject = false;

		data = {
			action: 'reject_with_feedback',
			data: rejectData,
			// eslint-disable-next-line no-undef
			_ajax_nonce: $gp_reject_feedback_settings.nonce,
		};

		$.ajax(
			{
				type: 'POST',
				// eslint-disable-next-line no-undef
				url: $gp_reject_feedback_settings.url,
				data: data,
			}
		).done(
			function() {
				$gp.editor.set_status( button, status );
				div.find( 'input[name="feedback_reason"]' ).prop( 'checked', false );
				div.find( 'textarea[name="feedback_comment"]' ).val( '' );
			}
		);
	}
// eslint-disable-next-line no-undef
}( jQuery, $gp )
);
