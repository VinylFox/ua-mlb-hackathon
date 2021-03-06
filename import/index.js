const fs = require("fs");

const Bluebird = require("bluebird");
const highland = require("highland");
const _ = require("lodash");
const Client = require("elasticsearch").Client;

const config = require("./config.json");
const pitchfxMapping = require("./mappings/pitchfx.json");

const client = new Client({
	host : config.elasticsearch
});

function getGameData() {
	return new Bluebird(resolve => {
		return highland(fs.createReadStream(require.resolve('./data/Context.csv')))
			.invoke("toString")
			.split("\n")
			.drop(1)
			.map(row => row.trim())
			.filter(row => row)
			.map(row => row.split(",").slice(1))
			.map(cols => cols.map(col => _.trim(col, '" ')))
			.map(cols => ({
				"game_id"         : cols[0],
				"league"          : cols[1],
				"day_night"       : cols[2],
				"playing_surface" : cols[3],
				"weather"         : cols[4],
				"wind_speed"      : cols[5],
				"wind_direction"  : cols[6],
				"temperature"     : cols[7]
			}))
			.reduce({}, (m, data) => (m[data.game_id] = data) && m)
			.toArray(arr => resolve(arr[0]));
	});

	return Bluebird
		.fromCallback(cb => fs.readFile(require.resolve('./data/Context.csv')));
}

function getPitcherData() {
	return new Bluebird(resolve => {
		return highland(fs.createReadStream(require.resolve('./data/Pitching_Statistics.csv')))
			.invoke("toString")
			.split("\n")
			.drop(1)
			.map(row => row.trim())
			.filter(row => row)
			.map(row => row.split(",").slice(1))
			.map(cols => cols.slice(0, 1).concat(cols.slice(1, 3).join(','), cols.slice(3)))
			.map(cols => cols.map(col => _.trim(col, '" ')))
			.map(cols => ({
				"pitcher_id" : cols[0],
				"name"       : cols[1],
				"birth_date" : cols[2],
				"org"        : cols[3],
				"league"     : cols[4],
				"G"          : cols[5],
				"GS"         : cols[6],
				"TBF"        : cols[7],
				"year"       : cols[8],
				"1B"         : cols[9],
				"2B"         : cols[10],
				"3B"         : cols[11],
				"HR"         : cols[12],
				"BB"         : cols[13],
				"IBB"        : cols[14],
				"HBP"        : cols[15],
				"SO"         : cols[16],
				"GB"         : cols[17],
				"LD"         : cols[18],
				"FB"         : cols[19],
				"ERA"        : cols[20],
				"RA9"        : cols[21],
				"FIP"        : cols[22],
				"r_WAR"      : cols[23]
			}))
			.map(data => _.pickBy(data, v => v !== "NA" && v !== "*.**"))
			.reduce({}, (m, data) => (m[data.pitcher_id] = data) && m)
			.toArray(arr => resolve(arr[0]));
	});

	return Bluebird
		.fromCallback(cb => fs.readFile(require.resolve('./data/Context.csv')));
}

function getBatterData() {
	return new Bluebird(resolve => {
		return highland(fs.createReadStream(require.resolve('./data/Batting_Statistics.csv')))
			.invoke("toString")
			.split("\n")
			.drop(1)
			.map(row => row.trim())
			.filter(row => row)
			.map(row => row.split(",").slice(1))
			.map(cols => cols.slice(0, 1).concat(cols.slice(1, 3).join(','), cols.slice(3)))
			.map(cols => cols.map(col => _.trim(col, '" ')))
			.map(cols => ({
				"batter_id"  : cols[0],
				"name"       : cols[1],
				"birth_date" : cols[2],
				"org"        : cols[3],
				"league"     : cols[4],
				"G"          : cols[5],
				"AB"         : cols[6],
				"PA"         : cols[7],
				"year"       : cols[8],
				"1B"         : cols[9],
				"2B"         : cols[10],
				"3B"         : cols[11],
				"HR"         : cols[12],
				"BB"         : cols[13],
				"HBP"        : cols[14],
				"IBB"        : cols[15],
				"SO"         : cols[16],
				"SB"         : cols[17],
				"CS"         : cols[18],
				"AVG"        : cols[19],
				"SLG"        : cols[20],
				"OBP"        : cols[21],
				"wOBA"       : cols[22],
				"rWAR"       : cols[23]
			}))
			.map(data => _.pickBy(data, v => v !== "NA" && v !== "*.**"))
			.reduce({}, (m, data) => (m[data.batter_id] = data) && m)
			.toArray(arr => resolve(arr[0]));
	});

	return Bluebird
		.fromCallback(cb => fs.readFile(require.resolve('./data/Context.csv')));
}

function importData(lookup) {
	return highland(fs.createReadStream(require.resolve('./data/Pitchfx.csv')))
		.invoke("toString")
		.split("\n")
		.drop(1)
		.map(row => row.trim())
		.filter(row => row)
		.map(row => row.split(","))
		.map(cols => cols.map(col => _.trim(col, '" ')))
		.map(cols => ({
			"row_id"           : cols[0],
			"game_id"          : cols[1],
			"game_date"        : cols[2],
			"year"             : cols[3],
			"sv_pitch_id"      : cols[4],
			"at_bat_number"    : cols[5],
			"pitch_number"     : cols[6],
			"inning"           : cols[7],
			"top_inning_sw"    : cols[8],
			"event_type"       : cols[9],
			"event_result"     : cols[10],
			"pre_balls"        : cols[11],
			"pre_strikes"      : cols[12],
			"pre_outs"         : cols[13],
			"batter_id"        : cols[14],
			"bat_side"         : cols[15],
			"pitcher_id"       : cols[16],
			"throws"           : cols[17],
			"initial_speed"    : cols[18],
			"plate_speed"      : cols[19],
			"pitch_type"       : cols[20],
			"break_x"          : cols[21],
			"break_z"          : cols[22],
			"plate_x"          : cols[23],
			"plate_z"          : cols[24],
			"init_pos_x"       : cols[25],
			"init_pos_y"       : cols[26],
			"init_pos_z"       : cols[27],
			"init_vel_x"       : cols[28],
			"init_vel_y"       : cols[29],
			"init_vel_z"       : cols[30],
			"init_accel_x"     : cols[31],
			"init_accel_y"     : cols[32],
			"init_accel_z"     : cols[33],
			"hit_trajectory"   : cols[34],
			"play_by_play"     : cols.slice(35, cols.length - 3).join(','),
			"runneron_1_st_id" : cols[cols.length - 3],
			"runneron_2_nd_id" : cols[cols.length - 2],
			"runneron_3_rd_id" : cols[cols.length - 1],
			"game"             : lookup.games[cols[1]],
			"pitcher"          : lookup.pitchers[cols[16]],
			"batter"           : lookup.batters[cols[14]]
		}))
		.map(data => _.pickBy(data, v => v !== "NA"))
		.batch(1000)
		.map(rows => ({
			body : _(rows)
				.map(row => ([
					{ index:  { _index: config.index, _type: config.index, _id : row.id } },
					row
				]))
				.flatten()
				.value()
		}))
		.map(req => client.bulk(req).then(res => res.errors && console.log(JSON.stringify(res, null, "\t"))))
		.map(highland)
		.mergeWithLimit(3)
		.through(s => new Bluebird(resolve => s.done(resolve)));
}

client.indices.delete({
		index : config.index
	})
	.catch(() => {})
	.then(() => client.indices.create({
		index : config.index,
		type  : config.index,
		body  : {
			mappings : _.zipObject([config.index], [{
				properties : pitchfxMapping
			}])
		}
	}))
	.then(() => Bluebird.props({
		games    : getGameData(),
		pitchers : getPitcherData(),
		batters  : getBatterData()
	}))
	.then(importData)
	.catch(console.log);
