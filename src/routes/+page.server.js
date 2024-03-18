import fs from 'fs'
import CsvReadableStream from 'csv-reader'

function readData(filename) {
    let inputStream = fs.createReadStream(filename, 'utf8');
    let data = []

    inputStream
	.pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true, asObject: true }))
	.on('data', function (row) {
	    data.push(row)
	})
    .on('error', function () {
        console.log('err')
    });

    return data;
}

const routes = readData('./static/google_transit/routes.txt')
const stops = readData('./static/google_transit/stops.txt')
const stopTimes = readData('./static/google_transit/stop_times.txt')
const trips = readData('./static/google_transit/trips.txt')

export function load() {
    return {
        routes,
        stops,
        stopTimes,
        trips
    }
}