$(function() {
  "use strict";

  var apixuKey = '91f999f0561d4d7a9b3155126171406';
  var apixuUrl = 'https://api.apixu.com/v1/current.json?key={key}&q={lat},{lon}';
  var weather = {};

  // ViewModel
  var AppViewModel = function() {
    var self = this,
        weatherPromise;

    // Observables
    this.weatherIcon = ko.observable('wi wi-day-cloudy-gusts');
    this.cityName = ko.observable('City');
    this.detailsPosition = ko.observable('Region, Country');
    this.temp = ko.observable('Temp');
    this.unit = ko.observable('celsius');

    // Switching celsius/fahrenheit
    this.toggleUnit = function() {
      this.toggleBackground();
      if (this.unit() === 'celsius') {
        this.unit('fahrenheit');
        this.temp(weather.temp_f);
      } else {
        this.unit('celsius');
        this.temp(weather.temp_c);
      }
    };

    this.toggleBackground = function(cb) {
      var $back = $('.wallpaper--back');
      var $front = $('.wallpaper--front');

      if ($front.css('display') === 'block') {
        fade($back, $front);
      } else if($front.css('display') === 'none') {
        fade($front, $back);
      }

      function fade($in, $out) {
        $in.css('background-image', 'url(' + selectBackground(self.temp(), self.unit()) + ')');
        while($in.css('background-image') === $out.css('background-image')) {
          $in.css('background-image', 'url(' + selectBackground(self.temp(), self.unit()) + ')');
        }
        $in.fadeIn(800, function() {
          $out.fadeOut(800);
          if (cb) {
            cb();
          }
        });
      }
    };

    weatherPromise = getWeather();
    weatherPromise.then(function(weather) {
      console.dir(weather);

      self.cityName(weather.city);
      self.detailsPosition(weather.region + ', ' + weather.country);

      if (self.unit() === 'celsius') {
        self.temp(weather.temp_c);
      } else {
        self.temp(weather.temp_f);
      }

      function weatherByCode(item) {
        return item.code == weather.code;
      }

      var conditionObj = conditions.find(weatherByCode);

      if (weather.is_day === '1') {
        self.weatherIcon('wi wi-day-' + conditionObj.icon[0]);
      } else {
        self.weatherIcon('wi wi-night-' + conditionObj.icon[1]);
      }

      self.toggleBackground();

    }).catch(function(reason) {
      self.toggleBackground(function() {
        alert(reason);
      });
    });

  };

  // Applying ViewModel bindings
  ko.applyBindings(new AppViewModel());

  // Storage manage object
  var storage = (function() {
    var prefix = 'fccLocal.';

    return {
      isAvailable: function(type) {
        var st,
            x = '__storage_test__';

        try {
          st = window[type];
          st.setItem(x, x);
          st.removeItem(x);

          return true;

        } catch (e) {

          return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            st.length !== 0;
        }
      },

      save: function(json) {
        console.log('Saving session storage...');
        var st = window.sessionStorage;

        for (var prop in json) {
          st.setItem(prefix + prop, json[prop]);
        }
      },

      load: function() {
        console.log('Loading session storage...');
        var st = window.sessionStorage;
        var json = {};

        for (var prop in st) {
          if (prop.startsWith(prefix)) {
            json[prop.substring(9)] = st.getItem(prop);
          }
        }

        return json;
      }
    };
  })();

  function getRandomUrl(season) {
    var list = ['winter', 'spring', 'summer', 'fall'];
    var num = Math.floor(Math.random() * 3) + 1;
    var mobile = '';

    if (season === undefined) {
      var index = Math.floor(Math.random() * 4);
      season = list[index];
    }

    return 'img/' + season + '-0' + num + ((window.innerWidth < 768) ? 'm' : '') + '.jpg';
  }

  function selectBackground(temp, unit) {
    var season = '';

    if (temp < 5 && unit === 'celsius' || temp < 41 && unit === 'fahrenheit') {
      season = 'winter';
    } else if (temp < 15 && unit === 'celsius' || temp < 59 && unit === 'fahrenheit') {
      season = 'fall';
    } else if (temp < 25 && unit === 'celsius' || temp < 77 && unit === 'fahrenheit') {
      season = 'spring';
    } else {
      season = 'summer';
    }

    return getRandomUrl(season);
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
        var last = 0,
            now = Date.now();

        if (storage.isAvailable('sessionStorage')) {
          last = window.sessionStorage.getItem('fccLocal.now');
        }

        // 10 minutes
        console.log('Last API call: ' + ((now - last) / 60000).toPrecision(3) + ' minutes');

        if ((now - last) > 600000) {
          var url = apixuUrl
            .replace(/{key}/, apixuKey)
            .replace(/{lat}/, position.coords.latitude)
            .replace(/{lon}/, position.coords.longitude);

          // get weather json API data
          $.getJSON(url, function(data) {
            console.log('Querying API...');

            json.now = Date.now();
            json.lat = position.coords.latitude;
            json.long = position.coords.longitude;
            json.city = data.location.name;
            json.country = data.location.country;
            json.region = data.location.region;
            json.temp_c = data.current.temp_c;
            json.temp_f = data.current.temp_f;
            json.humidity = data.current.humidity;
            json.precip = data.current.precip_mm;
            json.pressure = data.current.pressure_mb;
            json.vis_km = data.current.vis_km;
            json.wind_kph = data.current.wind_kph;
            json.wind_dir = data.current.wind_dir;
            json.clouds = data.current.cloud;
            json.code = data.current.condition.code;
            json.text = data.current.condition.text;
            json.icon = data.current.condition.icon;
            json.is_day = data.current.is_day;

            if (storage.isAvailable('sessionStorage')) {
              storage.save(json);
            }

            resolve(json);

          }).fail(function() {
            // getJSON API fail
            reject('Apiux API isn\'t responding now.');
          });

        } else {
          // get session storage
          json = storage.load();
          resolve(json);
        }
      }

      // getCurrentPosition error callback
      function error(err) {
        console.warn('error ' + err.code + ', ' + err.message);
        reject('Wasn\'t possible get the geographic possition now.');
      }
    });
  }
});
