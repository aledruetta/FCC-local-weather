$(function() {

  var openMapApiKey = 'b09e2b4e361fecae02a85343a8398e5c';
  var openMapWeatherUrl = 'http://api.openweathermap.org/data/2.5/forecast?id=524901&APPID={api_key}';
  // {layer} layer name
  // {z} number of zoom level
  // {x} number of x tile coordinate
  // {y} number of y tile coordinate
  // {api_key} Your API key
  var openMapLayerUrl = 'http://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={api_key}';

  var AppViewModel = function() {

    this.backgroundUrl = ko.observable(getRandomBackground());

  };

  function getRandomBackground(seasson) {
    var list = ['winter', 'spring', 'summer', 'fall'];
    var num = Math.floor(Math.random() * 3) + 1;

    if (seasson === undefined) {
      seasson = Math.floor(Math.random() * 4);
    }

    return 'img/' + list[seasson] + '-0' + num + '.jpg';
  }

  ko.applyBindings(new AppViewModel());

});
