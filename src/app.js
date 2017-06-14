$(function() {
  "use strict";

  var apixuKey = '91f999f0561d4d7a9b3155126171406';
  var apixuUrl = 'https://api.apixu.com/v1/current.json?key={key}&q={lat},{lon}';

  var getWeather = new Promise(function(resolve, reject) {
    if ('geolocation' in navigator) {
      var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(success, error, options);

    } else {
      reject('Geolocation is not enabled');
    }

    function success(position) {
      var weather = {};
      var coord = {lat: position.coords.latitude, lon: position.coords.longitude};
      var url = apixuUrl
        .replace(/{key}/, apixuKey)
        .replace(/{lat}/, coord.lat)
        .replace(/{lon}/, coord.lon);

      $.getJSON(url, function(data) {
        console.log(data);
        weather.city = data.location.name;
        weather.country = data.location.country;
        weather.region = data.location.region;
        weather.temp_c = data.current.temp_c;
        weather.temp_f = data.current.temp_f;
        weather.humidity = data.current.humidity;
        weather.precip = data.current.precip_mm;
        weather.pressure = data.current.pressure_mb;
        weather.visibility = data.current.vis_mk;
        weather.wind_kph = data.current.wind_kph;
        weather.wind_dir = data.current.wind_dir;
        weather.clouds = data.current.cloud;
        resolve(weather);
      });
    }

    function error(err) {
      console.warn(err.code, err.message);
    }
  });

  var AppViewModel = function() {
    var self = this;

    this.backgroundUrl = ko.observable(getRandomUrl());
    this.weatherIcon = ko.observable('wi wi-day-cloudy-gusts');
    this.cityName = ko.observable('');
    this.detailsPosition = ko.observable('');
    this.temp = ko.observable('');
    this.unit = ko.observable('fahrenheit');

    getWeather.then(function(weather) {
      console.log(JSON.stringify(weather));
      self.cityName(weather.city);
      self.detailsPosition(weather.region + ', ' + weather.country);
      if (self.unit === 'celsius') {
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
});
