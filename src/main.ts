import mqtt from "mqtt";

const client = mqtt.connect('mqtt://localhost');

client.on('connect', function() {
    client.publish('raspotify/playEvent', process.env.PLAYER_EVENT || 'stop');
    client.publish('raspotify/trackId', process.env.TRACK_ID || "");
    client.publish('raspotify/oldTrackId', process.env.OLD_TRACK_ID || "");
    client.end();
});
