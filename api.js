var Wug = require('node-weatherunderground');

var client = new Wug();
var opts = {
  key:'dd525f70218cde36', 
  city:'Baltimore', 
  state: 'MD'
}

module.exports = {
	getCurrentWeather: function(cb){
		client.conditions(opts, cb);
	}
};
