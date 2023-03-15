Shareabouts.PlaceFormView.prototype.events['change input[name="private-subscribe"]'] = 'onMailchimpSubscribeChange';
Shareabouts.PlaceFormView.prototype.onMailchimpSubscribeChange = function(evt) {
  var $emailInput = this.$el.find('input[name="private-submitter_email"]');
  var $emailOptionalLabel = this.$el.find('label[for="place-private-submitter_email"] small');

  if (evt.target.checked) {
    $emailInput.prop('required', true);
    $emailOptionalLabel.addClass('hidden');
  } else {
    $emailInput.prop('required', false);
    $emailOptionalLabel.removeClass('hidden');
  }
};

var mailchimp_original_AppView_viewNewPlace = Shareabouts.AppView.prototype.viewNewPlace;
Shareabouts.AppView.prototype.viewNewPlace = function() {
  mailchimp_original_AppView_viewNewPlace.call(this, ...arguments);
// var original_PlaceFormView_onSaveSuccess = Shareabouts.PlaceFormView.prototype.onSaveSuccess;
// Shareabouts.PlaceFormView.prototype.onSaveSuccess = function(model) {
//   original_PlaceFormView_onSaveSuccess.apply(this, arguments);
  if (this.placeFormView && this.placeFormView.model.get('private-subscribe') === 'true') {
    $.ajax({
      url: '/mailinglist/subscribe',
      type: 'POST',
      data: {
        email: this.placeFormView.model.get('private-submitter_email'),
      }
    });
  }
}