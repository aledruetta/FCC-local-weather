$(function() {
  "use strict";

  var openMapApiKey = 'b09e2b4e361fecae02a85343a8398e5c';
  var openMapWeatherUrl = 'http://api.openweathermap.org/data/2.5/forecast?id=524901&APPID={api_key}';
  // {layer} layer name
  // {z} number of zoom level
  // {x} number of x tile coordinate
  // {y} number of y tile coordinate
  // {api_key} Your API key
  var openMapLayerUrl = 'http://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={api_key}';

  var AppViewModel = function() {

    var self = this;
    this.backgroundUrl = ko.observable('');

    window.setInterval(function() {
      var back = getRandomBackground();
      self.backgroundUrl(back);
    }, 7000);
  };

  ko.bindingHandlers.fadeBackground = {
    update: function(element, valueAccessor) {
      var url = ko.unwrap(valueAccessor());
      var $div = $(element);

      $div.fadeToggle(800, function() {
        $div.css('background-image', 'url(' + url + ')');
        $div.fadeToggle(800);
      });
    }
  };

  ko.applyBindings(new AppViewModel());

  function getRandomBackground(seasson) {
    var list = ['winter', 'spring', 'summer', 'fall'];
    var num = Math.floor(Math.random() * 3) + 1;

    if (seasson === undefined) {
      seasson = Math.floor(Math.random() * 4);
    }

    return 'img/' + list[seasson] + '-0' + num + '.jpg';
  }
});
