var Wug = require('node-weatherunderground');
var elasticsearch = require('elasticsearch');

var client = new Wug();
var opts = {
  key:'dd525f70218cde36',
  city:'Baltimore',
  state: 'MD'
};

var esClient = new elasticsearch.Client({
  host: 'valencik.com:9200'
});

module.exports = {
	getCurrentWeather: function(cb){
		client.conditions(opts, cb);
	},
    getPitchFx: function(query, cb){
        esClient.search({
            index: 'pitchfx',
            body: query
        }, cb);
    }
};
