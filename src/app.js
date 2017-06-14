$(function() {
  "use strict";

  var openMapApiKey = 'b09e2b4e361fecae02a85343a8398e5c';
  var openMapWeatherUrl = 'https://crossorigin.me/http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}';
  // {layer} layer name
  // {z} number of zoom level
  // {x} number of x tile coordinate
  // {y} number of y tile coordinate
  // {api_key} Your API key
  var openMapLayerUrl = 'https://crossorigin.me/http://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={api_key}';

  var getWeather = new Promise(function(resolve, reject) {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var weather = {};
        var coord = {lat: position.coords.latitude, lon: position.coords.longitude};
        var url = openMapWeatherUrl
          .replace(/{api_key}/, openMapApiKey)
          .replace(/{lat}/, coord.lat)
          .replace(/{lon}/, coord.lon);

        $.getJSON(url, function(data) {
          weather.city = data.name;
          weather.country = data.sys.country;
          weather.temp = data.main.temp;
          weather.temp_min = data.main.temp_min;
          weather.temp_max = data.main.temp_max;
          weather.humidity = data.main.humidity;
          weather.pressure = data.main.pressure;
          weather.wind = data.wind;
          weather.clouds = data.clouds.all;
          resolve(weather);
        });
      });
    } else {
      reject('Geolocation is not enabled');
    }
  });

  var AppViewModel = function() {
    var self = this;

    this.backgroundUrl = ko.observable(getRandomUrl());
    this.weatherIcon = ko.observable('wi wi-day-cloudy-gusts');
    this.cityName = ko.observable('');
    this.detailsPosition = ko.observable('SP, Brazil');
    this.temp = ko.observable('');
    this.unit = ko.observable('fahrenheit');

    getWeather.then(function(weather) {
      console.log(JSON.stringify(weather));
      self.cityName(weather.city);
      self.temp(weather.temp);
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
