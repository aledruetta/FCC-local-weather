$(function() {
  "use strict";

  var apixuKey = '91f999f0561d4d7a9b3155126171406';
  var apixuUrl = 'https://api.apixu.com/v1/current.json?key={key}&q={lat},{lon}';

  // ViewModel
  var AppViewModel = function() {
    var self = this;
    var promise = getWeather();

    // Observables
    this.backgroundUrl = ko.observable(getRandomUrl());
    this.weatherIcon = ko.observable('wi wi-day-cloudy-gusts');
    this.cityName = ko.observable('');
    this.detailsPosition = ko.observable('');
    this.temp = ko.observable('');
    this.unit = ko.observable('celsius');

    promise.then(function(weather) {
      console.log(JSON.stringify(weather));
      self.cityName(weather.city);
      self.detailsPosition(weather.region + ', ' + weather.country);

      if (self.unit('celsius')) {
        self.temp(weather.temp_c);
      } else {
        self.temp(weather.temp_f);
      }
    });
  };

  ko.bindingHandlers.toggleBackground = {
    update: function(element, valueAccessor) {
      var $element = $(element);
      var display = $element.css('display');
      var value = ko.unwrap(valueAccessor());

      if (display === 'block') {
        $element.fadeOut(800);
      } else {
        $element.css('background-image', 'url(\'' + value + '\')');
        $element.fadeIn(800);
      }
    }
  };

  ko.applyBindings(new AppViewModel());

  function getRandomUrl(seasson) {
    var list = ['winter', 'spring', 'summer', 'fall'];
    var num = Math.floor(Math.random() * 3) + 1;

    if (seasson === undefined) {
      seasson = Math.floor(Math.random() * 4);
    }

    return 'img/' + list[seasson] + '-0' + num + '.jpg';
  }

  function getWeather() {
    return new Promise(function(resolve, reject) {
      if ('geolocation' in navigator) {
        var options = {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(success, error, options);
      } else {
        reject(Error('Geolocation is not enabled'));
      }

      function success(position) {
        var json = {};
        var coord = {lat: position.coords.latitude, lon: position.coords.longitude};
        var url = apixuUrl
        .replace(/{key}/, apixuKey)
        .replace(/{lat}/, coord.lat)
        .replace(/{lon}/, coord.lon);

        $.getJSON(url, function(data) {
          console.log(data);

          json.city = data.location.name;
          json.country = data.location.country;
          json.region = data.location.region;
          json.temp_c = data.current.temp_c;
          json.temp_f = data.current.temp_f;
          json.humidity = data.current.humidity;
          json.precip = data.current.precip_mm;
          json.pressure = data.current.pressure_mb;
          json.visibility = data.current.vis_mk;
          json.wind_kph = data.current.wind_kph;
          json.wind_dir = data.current.wind_dir;
          json.clouds = data.current.cloud;

          resolve(json);
        });
      }

      function error(err) {
        console.warn('Warn: error', err.code, err.message);
      }
    });
  }
});
