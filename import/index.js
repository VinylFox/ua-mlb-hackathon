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

function importData() {
	return highland(fs.createReadStream(require.resolve('./data/Pitchfx.csv')))
		.invoke("toString")
		.split("\n")
		.drop(1)
		.map(row => row.split(","))
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
			"runneron_3_rd_id" : cols[cols.length - 1]
		}))
		.map(data => _.mapValues(_.pickBy(data, v => v !== "NA"), v => _.trim(v, '" ')))
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
		.flatMap(highland)
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
	.then(importData)
	.catch(console.log);
