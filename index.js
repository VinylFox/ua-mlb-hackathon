var express = require('express');
var api = require('./api.js');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/db', function(request, response) {
  response.render('pages/db');
});

app.get('/api/:type', function(request, response) {
	switch (request.params.type) {
		case "currentweather":
			api.getCurrentWeather(function(err, data){
				response.json(data);
			});
			break;
        case "pitchfx":
            api.getPitchFx(request.body, function(err, data){
                response.json(data);
            });
            break;
	}
});

app.post('/api/:type', function(request, response) {
	switch (request.params.type) {
		case "pitchfx":
            api.getPitchFx(request.body, function(err, data){
                response.json(data);
            });
            break;
	}
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
