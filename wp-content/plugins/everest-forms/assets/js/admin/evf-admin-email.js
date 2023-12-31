/**
 * EverestFormsEmail JS
 * global evf_email_params
 */
;(function($) {
 	var s;
 	var EverestFormsEmail = {

 		settings: {
 			form   : $('#everest-forms-builder-form'),
 			spinner: '<i class="evf-loading evf-loading-active" />'
 		},
 		/**
		 * Start the engine.
		 *
		 */
		 init: function() {
		 	s = this.settings;

			$('.everest-forms-active-email-connections-list li').first().addClass('active-user');
			$('.evf-content-email-settings-inner').first().addClass('active-connection');

			EverestFormsEmail.bindUIActions();
		},

		ready: function() {

			s.formID = $('#everest-forms-builder-form').data('id');
		},

		/**
		 * Element bindings.
		 *
		 */
		 bindUIActions: function() {
		 	$(document).on('click', '.everest-forms-email-add', function(e) {
		 		EverestFormsEmail.connectionAdd(this, e);
		 	});
		 	$(document).on('click', '.everest-forms-active-email-connections-list li', function(e) {
		 		EverestFormsEmail.selectActiveAccount(this, e);
		 	});
		 	$(document).on('click', '.email-remove', function(e) {
		 		EverestFormsEmail.removeAccount(this, e);
		 	});
		 	$(document).on('click', '.email-default-remove', function(e) {
		 		EverestFormsEmail.removeDefaultAccount(this, e);
		 	});
		 	$(document).on('input', '.everest-forms-email-name input', function(e) {
		 		EverestFormsEmail.renameConnection(this, e);
			});
			$(document).on('focusin', '.everest-forms-email-name input', function(e) {
				EverestFormsEmail.focusConnectionName(this, e);
			});
			$(document).on('createEmailConnection', '.everest-forms-email-add', function(e, data){
				EverestFormsEmail.addNewEmailConnection($(this), data);
			});
		},
		connectionAdd: function(el, e) {
		 	e.preventDefault();

		 	var $this    = $(el),
		 	source       = 'email',
		 	type         = $this.data('type'),
		 	namePrompt   = evf_email_params.i18n_email_connection,
		 	nameField    = '<input autofocus="" type="text" id="provider-connection-name" placeholder="'+evf_email_params.i18n_email_placeholder+'">',
		 	nameError    = '<p class="error">'+evf_email_params.i18n_email_error_name+'</p>',
		 	modalContent = namePrompt+nameField+nameError;

		 	modalContent = modalContent.replace(/%type%/g,type);
		 	$.confirm({
		 		title: false,
		 		content: modalContent,
				icon: 'dashicons dashicons-info',
		 		type: 'blue',
		 		backgroundDismiss: false,
		 		closeIcon: false,
		 		buttons: {
		 			confirm: {
		 				text: evf_email_params.i18n_email_ok,
		 				btnClass: 'btn-confirm',
		 				keys: ['enter'],
		 				action: function() {
		 					var input = this.$content.find('input#provider-connection-name');
							 var error = this.$content.find('.error');
							 var value = input.val().trim();
		 					if ( value.length === 0 ) {
		 						error.show();
		 						return false;
		 					} else {
		 						var name = value;

								// Fire AJAX
								var data =  {
									action  : 'everest_forms_new_email_add',
									source  : source,
									name    : name,
									id      : s.form.data('id'),
									security: evf_email_params.ajax_email_nonce
								}
								$.ajax({
									url: evf_email_params.ajax_url,
									data: data,
									type: 'POST',
									success: function(response) {
										EverestFormsEmail.addNewEmailConnection($this, {response:response, name:name});
									}
								});
							}
						}
					},
					cancel: {
						text: evf_email_params.i18n_email_cancel
					}
				}
			});
		},

		addNewEmailConnection: function( el, data ){
			var $this= el;
			var response = data.response;
			var name = data.name;
			var $connections = $this.closest('.everest-forms-panel-sidebar-content');
			var form_title = $('#everest-forms-panel-field-settings-form_title:first').val() + '-' + Date.now();
			var cloned_email = $('.evf-content-email-settings').first().clone();
			$('.evf-content-email-settings-inner').removeClass('active-connection');
			cloned_email.find('input:not(#qt_everest_forms_panel_field_email_connection_1_evf_email_message_toolbar input[type="button"], .evf_conditional_logic_container input)').val('');

			cloned_email.find('.evf_conditional_logic_container input[type="checkbox"]').prop('checked', false);
			cloned_email.find('.everest-forms-attach-pdf-to-admin-email input[type="checkbox"]').prop('checked', false);
			cloned_email.find('.everest-forms-csv-file-email-attachments input[type="checkbox"]').prop('checked', false);
			cloned_email.find('.everest-forms-show-header-in-attachment-pdf-file input[type="checkbox"]').prop('checked', false);
			cloned_email.find('.everest-forms-file-email-attachments  input[type="checkbox"]').prop('checked', false);
			cloned_email.find('.everest-forms-enable-email-prompt input[type="checkbox"]').prop('checked', false);
			cloned_email.find('.evf-email-message-prompt textarea').val('');
			cloned_email.find('.everest-forms-email-name input').val(name);

			cloned_email.find('.everest-forms-show-header-in-attachment-pdf-file').hide();
			cloned_email.find('.evf-email-message-prompt').hide();
			cloned_email.find('.everest-forms-show-pdf-file-name').hide();
			cloned_email.find('.evf-field-conditional-container').hide();
			cloned_email.find('.evf-field-conditional-wrapper li:not(:first)').remove();
			cloned_email.find('.conditional_or:not(:first)').remove();
			cloned_email.find('.everest-forms-email-name input').val(name);

			setTimeout(function() {
				cloned_email.find('.evf-field-conditional-input').val('');
			}, 2000);

			cloned_email.find('.evf-content-email-settings-inner').attr('data-connection_id',response.data.connection_id);
			cloned_email.find('.evf-content-email-settings-inner').removeClass( 'everest-forms-hidden' );
			//Email toggle options.
			cloned_email.find( '.evf-toggle-switch input' ).attr( 'name', 'settings[email][' + response.data.connection_id + '][enable_email_notification]' );
			cloned_email.find( '.evf-toggle-switch input:checkbox' ).attr( 'data-connection-id',  response.data.connection_id );
			cloned_email.find( '.evf-toggle-switch input:checkbox' ).prop( 'checked', true );
			cloned_email.find( '.evf-toggle-switch input:checkbox' ).val( '1' );

			// Hiding Toggle for Prevous Email Setting.
			$('.evf-content-email-settings .evf-content-section-title').css( 'display', 'none' );
			$('.evf-content-email-settings').css( 'display', 'none' );
			// Removing email-disable-message;
			$( '.email-disable-message' ).remove();
			$('.evf-enable-email-toggle').addClass('everest-forms-hidden');
			// Removing Cloned email-disable-message;
			cloned_email.find( '.email-disable-message' ).remove();
			cloned_email.find( '.evf-enable-email-toggle' ).addClass('everest-forms-hidden');
			// Showing Toggle for Current Email Setting.
			cloned_email.find( '.evf-toggle-switch' ).parents( '.evf-content-section-title' ).css( 'display', 'flex' );
			cloned_email.find( '.evf-toggle-switch' ).parents( '.evf-content-email-settings' ).css( 'display', '' );

			cloned_email.find('.evf-field-conditional-container').attr('data-connection_id',response.data.connection_id);
			cloned_email.find('#everest-forms-panel-field-email-connection_1-connection_name').attr('name', 'settings[email]['+response.data.connection_id+'][connection_name]');
			cloned_email.find('#everest-forms-panel-field-email-connection_1-evf_to_email').attr('name', 'settings[email]['+response.data.connection_id+'][evf_to_email]');
			cloned_email.find('#everest-forms-panel-field-email-connection_1-evf_to_email').val( '{admin_email}' );
			cloned_email.find('#everest-forms-panel-field-email-connection_1-evf_carboncopy').attr('name', 'settings[email]['+response.data.connection_id+'][evf_carboncopy]');
			cloned_email.find('#everest-forms-panel-field-email-connection_1-evf_blindcarboncopy').attr('name', 'settings[email]['+response.data.connection_id+'][evf_blindcarboncopy]');
			cloned_email.find('#everest-forms-panel-field-email-connection_1-evf_from_name').attr('name', 'settings[email]['+response.data.connection_id+'][evf_from_name]');
			cloned_email.find('#everest-forms-panel-field-email-connection_1-evf_from_name').val( evf_email_params.from_name );
			cloned_email.find('#everest-forms-panel-field-email-connection_1-evf_from_email').attr('name', 'settings[email]['+response.data.connection_id+'][evf_from_email]');
			cloned_email.find('#everest-forms-panel-field-email-connection_1-evf_from_email').val( '{admin_email}' );
			cloned_email.find('#everest-forms-panel-field-email-connection_1-evf_reply_to').attr('name', 'settings[email]['+response.data.connection_id+'][evf_reply_to]');
			cloned_email.find('#everest-forms-panel-field-email-connection_1-evf_email_subject').attr('name', 'settings[email]['+response.data.connection_id+'][evf_email_subject]');
			cloned_email.find('#everest-forms-panel-field-email-connection_1-evf_email_subject').val( evf_email_params.email_subject );
			cloned_email.find('#everest_forms_panel_field_email_connection_1_evf_email_message').attr('name', 'settings[email]['+response.data.connection_id+'][evf_email_message]');
			cloned_email.find('#everest_forms_panel_field_email_connection_1_evf_email_message').val( '{all_fields}' );


			cloned_email.find('#everest-forms-panel-field-settingsemailconnection_1-file-email-attachments').attr('name', 'settings[email]['+response.data.connection_id+'][file-email-attachments]');
			cloned_email.find('#everest-forms-panel-field-settingsemailconnection_1-file-email-attachments').val(1);
			cloned_email.find('#everest-forms-panel-field-settingsemailconnection_1-file-email-attachments').attr('id', 'everest-forms-panel-field-settingsemail'+response.data.connection_id+'-file-email-attachments');
			cloned_email.find('label[for="everest-forms-panel-field-settingsemailconnection_1-file-email-attachments"]').attr('for', 'everest-forms-panel-field-settingsemail'+response.data.connection_id+'-file-email-attachments');
			cloned_email.find('input[name="settings[email][connection_1][file-email-attachments]"]').remove();

			cloned_email.find('#everest-forms-panel-field-settingsemailconnection_1-attach_pdf_to_admin_email').attr('name', 'settings[email]['+response.data.connection_id+'][attach_pdf_to_admin_email]');
			cloned_email.find('#everest-forms-panel-field-settingsemailconnection_1-attach_pdf_to_admin_email').val(1);
			cloned_email.find('#everest-forms-panel-field-settingsemailconnection_1-attach_pdf_to_admin_email').attr('id', 'everest-forms-panel-field-settingsemail'+response.data.connection_id+'-attach_pdf_to_admin_email');
			cloned_email.find('label[for="everest-forms-panel-field-settingsemailconnection_1-attach_pdf_to_admin_email"]').attr('for', 'everest-forms-panel-field-settingsemail'+response.data.connection_id+'-attach_pdf_to_admin_email');
			cloned_email.find('input[name="settings[email][connection_1][attach_pdf_to_admin_email]"]').remove();

			cloned_email.find('#everest-forms-panel-field-settingsemailconnection_1-csv-file-email-attachments').attr('name', 'settings[email]['+response.data.connection_id+'][csv-file-email-attachments]');
			cloned_email.find('#everest-forms-panel-field-settingsemailconnection_1-csv-file-email-attachments').val(1);
			cloned_email.find('#everest-forms-panel-field-settingsemailconnection_1-csv-file-email-attachments').attr('id', 'everest-forms-panel-field-settingsemail'+response.data.connection_id+'-csv-file-email-attachments');
			cloned_email.find('label[for="everest-forms-panel-field-settingsemailconnection_1-csv-file-email-attachments"]').attr('for', 'everest-forms-panel-field-settingsemail'+response.data.connection_id+'-csv-file-email-attachments');
			cloned_email.find('input[name="settings[email][connection_1][csv-file-email-attachments]"]').remove();

			cloned_email.find('#everest-forms-panel-field-email-connection_1-enable_ai_email_prompt').attr('name', 'settings[email]['+response.data.connection_id+'][enable_ai_email_prompt]');
			cloned_email.find('#everest-forms-panel-field-email-connection_1-enable_ai_email_prompt').val(1);
			cloned_email.find('#everest-forms-panel-field-email-connection_1-enable_ai_email_prompt').attr('id', 'everest-forms-panel-field-settingsemail'+response.data.connection_id+'-enable_ai_email_prompt');
			cloned_email.find('label[for="everest-forms-panel-field-email-connection_1-enable_ai_email_prompt"]').attr('for', 'everest-forms-panel-field-settingsemail'+response.data.connection_id+'-enable_ai_email_prompt');
			cloned_email.find('input[name="settings[email][connection_1][enable_ai_email_prompt]"]').remove();

			cloned_email.find('#everest-forms-panel-field-email-connection_1-evf_email_message_prompt').attr('name', 'settings[email]['+response.data.connection_id+'][evf_email_message_prompt]');


			cloned_email.find('#everest-forms-panel-field-settingsemailconnection_1-show_header_in_attachment_pdf_file').attr('name', 'settings[email]['+response.data.connection_id+'][show_header_in_attachment_pdf_file]');
			cloned_email.find('#everest-forms-panel-field-settingsemailconnection_1-show_header_in_attachment_pdf_file').val(1);
			cloned_email.find('#everest-forms-panel-field-settingsemailconnection_1-show_header_in_attachment_pdf_file').attr('id', 'everest-forms-panel-field-settingsemail'+response.data.connection_id+'-show_header_in_attachment_pdf_file');
			cloned_email.find('label[for="everest-forms-panel-field-settingsemailconnection_1-show_header_in_attachment_pdf_file"]').attr('for', 'everest-forms-panel-field-settingsemail'+response.data.connection_id+'-show_header_in_attachment_pdf_file');
			cloned_email.find('input[name="settings[email][connection_1][show_header_in_attachment_pdf_file]"]').remove();

			cloned_email.find('#everest-forms-panel-field-settingsemailconnection_1-pdf_name').attr('name', 'settings[email]['+response.data.connection_id+'][pdf_name]');
			cloned_email.find('#everest-forms-panel-field-settingsemailconnection_1-pdf_name').val(form_title);
			cloned_email.find('#everest-forms-panel-field-settingsemailconnection_1-pdf_name').attr("id", 'everest-forms-panel-field-settingsemail' + response.data.connection_id + '-pdf_name');

			cloned_email.find('.everest-forms-attach-pdf-to-admin-email').attr('id', 'everest-forms-panel-field-settingsemailconnection_' + response.data.connection_id + '-attach_pdf_to_admin_email-wrap');
			cloned_email.find('.everest-forms-show-header-in-attachment-pdf-file ').attr('id', 'everest-forms-panel-field-settingsemailconnection_' + response.data.connection_id + '-show_header_in_attachment_pdf_file-wrap');

			cloned_email.find('#everest-forms-panel-field-email-connection_1-conditional_logic_status').attr('name', 'settings[email]['+response.data.connection_id+'][conditional_logic_status]');
			cloned_email.find('.evf_conditional_logic_container input[type="hidden"]').attr('name', 'settings[email]['+response.data.connection_id+'][conditional_logic_status]');
			cloned_email.find('.evf-field-show-hide').attr('name', 'settings[email]['+response.data.connection_id+'][conditional_option]');
			cloned_email.find('.evf-field-conditional-field-select').attr('name', 'settings[email]['+response.data.connection_id+'][conditionals][1][1][field]');
			cloned_email.find('.evf-field-conditional-condition').attr('name', 'settings[email]['+response.data.connection_id+'][conditionals][1][1][operator]');
			cloned_email.find('.evf-field-conditional-input').attr('name', 'settings[email]['+response.data.connection_id+'][conditionals][1][1][value]');
			$cloned_email = cloned_email.append('<input type="hidden" name="settings[email]['+response.data.connection_id+'][connection_name]" value="'+name+'">');

			$('.evf-email-settings-wrapper').append(cloned_email);
			$connections.find('.evf-content-email-settings-inner').last().addClass('active-connection');
			$this.parent().find('.everest-forms-active-email-connections-list li').removeClass('active-user');
			$this.closest('.everest-forms-active-email.active').children('.everest-forms-active-email-connections-list').removeClass('empty-list');
			$this.parent().find('.everest-forms-active-email-connections-list').append(
				'<li class="connection-list active-user" data-connection-id="' + response.data.connection_id + '">' +
					'<a class="user-nickname" href="#">' + name + '</a>' +
					'<div class="evf-email-side-section">' +
						'<div class="evf-toggle-section">' +
							'<span class="everest-forms-toggle-form">' +
								'<input type="hidden" name="settings[email][' + response.data.connection_id + '][enable_email_notification]" value="0" class="widefat">' +
								'<input type="checkbox" class="evf-email-toggle" name="settings[email][' + response.data.connection_id + '][enable_email_notification]" value="1" data-connection-id="' + response.data.connection_id + '" checked="checked">' +
								'<span class="slider round"></span>' +
							'</span>' +
						'</div>' +
						'<span class="evf-vertical-divider"></span>' +
						'<a href="#">' +
							'<span class="email-remove">' +
							'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
								'<path fill-rule="evenodd" d="M9.293 3.293A1 1 0 0 1 10 3h4a1 1 0 0 1 1 1v1H9V4a1 1 0 0 1 .293-.707ZM7 5V4a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1h4a1 1 0 1 1 0 2h-1v13a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7H3a1 1 0 1 1 0-2h4Zm1 2h10v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7h2Zm2 3a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Zm5 7v-6a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0Z" clip-rule="evenodd"/>' +
							'</svg></span>' +
						'</a>' +
					'</div>' +
				'</li>'
			);


		},

		selectActiveAccount: function(el, e) {
			// e.preventDefault();

			var $this         = $(el),
			connection_id = $this.data('connection-id'),
			active_block  = $('.evf-content-email-settings').find('[data-connection_id="' + connection_id + '"]'),
			lengthOfActiveBlock = $(active_block).length;

			$('.evf-content-email-settings').find('.evf-content-email-settings-inner').removeClass('active-connection');

			// Hiding Email Notificaton Trigger (Previous).
			$( '.evf-content-section-title' ).has('[data-connection-id=' + $this.siblings('.active-user').attr( 'data-connection-id' ) +']').css( 'display', 'none' );
			$( '.evf-content-section-title' ).has('[data-connection-id=' + $this.siblings('.active-user').attr( 'data-connection-id' ) +']').parent().css( 'display', 'none' );
			$this.siblings().removeClass('active-user');
			$this.addClass('active-user');

			if( lengthOfActiveBlock ){
				$( active_block ).addClass('active-connection');
			}

			// Removing Email Notification Turn On Message.
			$('.email-disable-message').remove();
			if( $( 'input[data-connection-id=' + $this.attr( 'data-connection-id' ) +']:last' ).prop( 'checked' ) == false ) {
				$( '<p class="email-disable-message everest-forms-notice everest-forms-notice-info">' + evf_data.i18n_email_disable_message + '</p>' ).insertAfter( $( '.evf-content-section-title' ).has('[data-connection-id=' + $this.attr( 'data-connection-id' ) +']') );
			}

			// Displaying Email Notificaton Trigger (Current).
			$( '.evf-content-section-title' ).has('[data-connection-id=' + $this.attr( 'data-connection-id' ) +']').css( 'display', 'flex' );
			$( '.evf-content-section-title' ).has('[data-connection-id=' + $this.attr( 'data-connection-id' ) +']').parent().css( 'display', '' );
		},

		removeAccount: function(el, e) {
			e.preventDefault();

			var $this = $(el),
			connection_id = $this.parent().parent().parent().data('connection-id'),
			active_block  = $('.evf-content-email-settings').find('[data-connection_id="' + connection_id + '"]'),
			lengthOfActiveBlock = $(active_block).length;
				$.confirm({
					title: false,
					content: "Are you sure you want to delete this Email?",
					backgroundDismiss: false,
					closeIcon: false,
					icon: 'dashicons dashicons-info',
					type: 'orange',
					buttons: {
						confirm: {
							text: evf_email_params.i18n_email_ok,
							btnClass: 'btn-confirm',
							keys: ['enter'],
							action: function(){
								if( lengthOfActiveBlock ){
									var toBeRemoved = $this.parent().parent().parent();
									active_block_after  = $('.evf-provider-connections').find('[data-connection_id="' + connection_id + '"]'),
									lengthOfActiveBlockAfter = $(active_block).length;
									if( toBeRemoved.prev().length ){
										toBeRemoved.prev('.connection-list').trigger('click');
									}else {
										toBeRemoved.next('.connection-list').trigger('click');
									}

									$( active_block ).parent().remove();
									toBeRemoved.remove();
								}
							}
						},
						cancel: {
							text: evf_email_params.i18n_email_cancel
						}
					}
				});
		},

		removeDefaultAccount: function( el, e ) {
			e.preventDefault;
			$.alert({
				title: false,
				content: "Default Email can not be deleted !",
				icon: 'dashicons dashicons-info',
				type: 'blue',
				buttons: {
					ok: {
						text: evf_data.i18n_ok,
						btnClass: 'btn-confirm',
						keys: [ 'enter' ]
					}
				}
			});
		},

		focusConnectionName: function( el,e ){
			var $this = $(el);
			$this.data('val', $this.val().trim());
		},

		renameConnection: function( el,e ){
			e.preventDefault;
			var $this = $(el);
			var connection_id = $this.closest('.evf-content-email-settings-inner').data('connection_id');
			$active_block = $('.everest-forms-active-email-connections-list').find('[data-connection-id="' + connection_id + '"]');
			$active_block.find('.user-nickname').text($this.val());
			if ( $this.val().trim().length === 0 ) {
				$this.parent('.everest-forms-email-name').find('.everest-forms-error').remove();
				$this.parent('.everest-forms-email-name').append('<p class="everest-forms-error everest-forms-text-danger">Email name cannot be empty.</p>');
				$this.next('.everest-forms-error').fadeOut(3000);
				setTimeout(function() {
					if ( $this.val().length === 0 ){
						$this.val($this.data('val'));
						$active_block.find('.user-nickname').text($this.data('val'));
					}
				}, 3000);
			}
		}
 	}
	EverestFormsEmail.init();
})(jQuery);
