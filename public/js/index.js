$(function() {

	$.getJSON('/api/currentweather',function(data){
		$('.curtemp > span').html(data.temperature_string);
	});

});