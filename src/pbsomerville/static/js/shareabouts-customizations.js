// Toggle between place-specific and city-wide mode
// ================================================
//
// On the place form, we have an option for toggling between a place-specific
// idea and a city-wide idea. The form field name is "city_wide" and should be
// present in the flavor configuration.
//
// When the user toggles between place-specific and city-wide, a data attribute
// is added to the body element. This attribute is used to hide/show the
// place-specific fields in the form, the prompt to move the map to set the
// idea's location, and the location pin on the map.
//
// See also the accompanying styles related to "city_wide" in the custom CSS,
// and the place.city_wide_location_label config.yml option.

// Handler for the city-wide checkbox:
Shareabouts.PlaceFormView.prototype.events['change input[name="city_wide"]'] = 'onCityWideChange';
Shareabouts.PlaceFormView.prototype.onCityWideChange = function(evt) {
  if (evt.currentTarget.checked) {
    this.resetCityWide(evt.currentTarget.value);
  }
}

// Procudure to reconfigure the form based on the city-wide status:
Shareabouts.PlaceFormView.prototype.resetCityWide = function(isCityWide) {
  $('body').attr('data-city_wide', isCityWide);

  if (isCityWide == 'true') {
    this.setCityWideLatLng();
  } else {
    this.unsetLatLng();
  }
}

// Use a custom version of the form view's setLocation function when city-wide
// is set to true:
var original_PlaceFormView_setLocation = Shareabouts.PlaceFormView.prototype.setLocation;
function cityWide_PlaceFormView_setLocation() {
  const location = null;
  this.$('.location-receiver').html(this.options.placeConfig.city_wide_location_label);
}

// Save the original version of the form view's setLatLng function so that we
// can set it to no-op when city-wide is set to true:
var original_PlaceFormView_setLatLng = Shareabouts.PlaceFormView.prototype.setLatLng;

// Set a location near City Hall:
Shareabouts.PlaceFormView.prototype.setCityWideLatLng = function(latLng) {
  const pt = turf.point([-71.09819412231447, 42.38719709686778]); // <- Somerville City Hall.

  // Offset city-wide ideas some random amount within 50 meters.
  const offsetDist = Math.random() * 50;
  const offsetDir = Math.random() * 360;
  const randpt = turf.transformTranslate(pt, offsetDist, offsetDir, {units: 'meters'});

  this.setLatLng({lng: randpt.geometry.coordinates[0], lat: randpt.geometry.coordinates[1]});

  // Make it so that any actions that would normally alter the form's latlng
  // (like moving the map) will have no effect.
  Shareabouts.PlaceFormView.prototype.setLatLng = function() {};

  // Update the reverse geocoded label too.
  Shareabouts.PlaceFormView.prototype.setLocation = cityWide_PlaceFormView_setLocation;
  this.setLocation();
}

// Return the form to the state of needing to select a location:
Shareabouts.PlaceFormView.prototype.unsetLatLng = function() {
  this.center = null;
  this.$('.drag-marker-instructions').removeClass('is-visuallyhidden');
  this.$('.approx-address, .drag-marker-warning').addClass('is-visuallyhidden');

  // Restore the original setLocation function and location label.
  Shareabouts.PlaceFormView.prototype.setLatLng = original_PlaceFormView_setLatLng;
  Shareabouts.PlaceFormView.prototype.setLocation = original_PlaceFormView_setLocation;
  this.location = null;
  this.$('.location-receiver').html(this.options.placeConfig.unset_location_label);
}

// After the user submits their idea, revert the body and the place form back
// to their original states:
var original_AppView_newPlace = Shareabouts.AppView.prototype.newPlace;
Shareabouts.AppView.prototype.newPlace = function() {
  $('body').removeAttr('data-city_wide');
  Shareabouts.PlaceFormView.prototype.setLatLng = original_PlaceFormView_setLatLng;
  Shareabouts.PlaceFormView.prototype.setLocation = original_PlaceFormView_setLocation;

  original_AppView_newPlace.call(this, ...arguments);
}

// Toggle the personal information survey
Shareabouts.PlaceFormView.prototype.events['change input[name="private-completed_personal_info_survey"]'] = 'onPersonalInfoCompleteChange';
Shareabouts.PlaceFormView.prototype.onPersonalInfoCompleteChange = function(evt) {
  if (evt.currentTarget.checked) {
    this.resetPersonalInformationSurvey(evt.currentTarget.value);
  }
}

Shareabouts.PlaceFormView.prototype.resetPersonalInformationSurvey = function(hasCompleted) {
  // By default, use the personal info completed value from the selected radio
  // button.
  if (hasCompleted === undefined) {
    hasCompleted = this.$('[name="private-completed_personal_info_survey"]:checked').val();
  }

  // Toggle the visibility of the personal info fields based on the answer.
  this.$('[data-personal-info]')
    .closest('.field')
    .toggleClass('hidden', hasCompleted === 'true');
}

// Reset the personal information survey when the form is initially rendered.
var original_PlaceFormView_render = Shareabouts.PlaceFormView.prototype.render;
Shareabouts.PlaceFormView.prototype.render = function() {
  const result = original_PlaceFormView_render.call(this, ...arguments);
  this.resetPersonalInformationSurvey();
  return result;
}

// Provide a way to loop through location types in a template.
Handlebars.registerHelper('each_place_type', function() {
  const args = Array.from(arguments);
  const options = args.slice(-1)[0];
  const exclusions = args.slice(0, args.length-1);

  let result = '';
  for (const [type, typeOptions] of Object.entries(Shareabouts.Config.placeTypes)) {
    const data = {
      type,
      ...typeOptions
    };

    // if not an exclusion
    if (!exclusions.includes(type)) {
      result += options.fn(data);
    }
  }

  return result;
});

// Provide a way to count the number of places for a given location type.
Handlebars.registerHelper('count_places', function(type) {
  const places = window.app.collection.models;
  if (type) {
    return places.filter(place => place.get('location_type') === type).length;
  } else {
    return places.length;
  }
});

// Add the current count of places to the location type filter menu.

// Add the current count of places to the place list view.
var original_PlaceListView_ui = Shareabouts.PlaceListView.prototype.ui;
Shareabouts.PlaceListView.prototype.ui = {
  ...original_PlaceListView_ui,
  placeCount: '.place-count'
};

Shareabouts.PlaceListView.prototype.updatePlaceCount = _.debounce(function() {
  const visibleViews = Object.values(this.views).filter(v => v.$el.is(':visible'));
  this.ui.placeCount.text(visibleViews.length);
}, 50, false);

var original_PlaceListView_onAfterItemAdded = Shareabouts.PlaceListView.prototype.onAfterItemAdded;
Shareabouts.PlaceListView.prototype.onAfterItemAdded = function() {
  const result = original_PlaceListView_onAfterItemAdded.call(this, ...arguments);
  this.updatePlaceCount();
  return result;
}

var original_PlaceListView_applyFilters = Shareabouts.PlaceListView.prototype.applyFilters;
Shareabouts.PlaceListView.prototype.applyFilters = function() {
  const result = original_PlaceListView_applyFilters.call(this, ...arguments);
  this.updatePlaceCount();
  return result;
}
