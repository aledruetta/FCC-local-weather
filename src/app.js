$(function() {
  "use strict";

  var apixuKey = '91f999f0561d4d7a9b3155126171406';
  var apixuUrl = 'https://api.apixu.com/v1/current.json?key={key}&q={lat},{lon}';
  var weather = {};

  // ViewModel
  var AppViewModel = function() {
    var self = this;
    var promise = getWeather();

    // Observables
    this.backgroundUrl = ko.observable(getRandomUrl());
    this.weatherIcon = ko.observable('wi wi-day-cloudy-gusts');
    this.cityName = ko.observable('City');
    this.detailsPosition = ko.observable('Region, Country');
    this.temp = ko.observable('Temp');
    this.unit = ko.observable('celsius');

    // Switching celsius/fahrenheit
    this.toggleUnit = function() {
      if (this.unit() === 'celsius') {
        this.unit('fahrenheit');
        this.temp(weather.temp_f);
      } else {
        this.unit('celsius');
        this.temp(weather.temp_c);
      }
    };

    promise.then(function(json) {
      console.log(JSON.stringify(json));

      weather = json;
      self.backgroundUrl(selectBackground(weather.temp_c));
      self.cityName(weather.city);
      self.detailsPosition(weather.region + ', ' + weather.country);

      if (self.unit() === 'celsius') {
        self.temp(weather.temp_c);
      } else {
        self.temp(weather.temp_f);
      }
    }).catch(function(reason) {
      alert(reason);
    });
  };

  ko.bindingHandlers.toggleBackground = {
    update: function(element, valueAccessor) {
      var $element = $(element);
      var display = $element.css('display');
      var value = ko.unwrap(valueAccessor());

      if (value) {
        if (display === 'block') {
          $element.fadeOut(800);
        } else {
          $element.css('background-image', 'url(\'' + value + '\')');
          $element.fadeIn(800);
        }
      }
    }
  };

  ko.applyBindings(new AppViewModel());

  function getRandomUrl(seasson) {
    var list = ['winter', 'spring', 'summer', 'fall'];
    var num = Math.floor(Math.random() * 3) + 1;

    if (seasson === undefined) {
      var index = Math.floor(Math.random() * 4);
      seasson = list[index];
    }

    return 'img/' + seasson + '-0' + num + '.jpg';
  }

  function selectBackground(temp) {
    var seasson = '';

    if (temp < 5) {
      seasson = 'winter';
    } else if (temp < 15) {
      seasson = 'fall';
    } else if (temp < 25) {
      seasson = 'spring';
    } else {
      seasson = 'summer';
    }

    return getRandomUrl(seasson);
  }

  function getWeather() {
    return new Promise(function(resolve, reject) {
      if ('geolocation' in navigator) {

        console.log('Gelocation enabled.');

        // getCurrentPosition options
        var options = {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 600000
        };

        navigator.geolocation.getCurrentPosition(success, error, options);

      } else {
        reject(Error('Geolocation is not enabled'));
      }

      // getCurrentPosition success callback
      function success(position) {
        var json = {};
        var url = apixuUrl
        .replace(/{key}/, apixuKey)
        .replace(/{lat}/, position.coords.latitude)
        .replace(/{lon}/, position.coords.longitude);

        // get weather json API data
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

        // getJSON API fail
        }).fail(function() {
          reject('Apiux API isn\'t responding now.');
        });
      }

      // getCurrentPosition error callback
      function error(err) {
        console.warn('error ' + err.code + ', ' + err.message);
        reject('Wasn\'t possible get the geographic possition now.');
      }
    });
  }
});
