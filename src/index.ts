#!/usr/bin/env node
import {httpServer} from "./http/index.js";
import {SpotifyClient} from "./spotify/index.js";
import NodeCache from "node-cache";
import {MqttClient} from "./mqtt/index.js";
import gracefulShutdown from "http-graceful-shutdown";

if (!process.env.SPOTIFY_CLIENT_ID) {
    throw new Error("Missing SPOTIFY_CLIENT_ID from environment");
}
if (!process.env.SPOTIFY_CLIENT_SECRET) {
    throw new Error("Missing SPOTIFY_CLIENT_SECRET from environment");
}
if (!process.env.PORT) {
    throw new Error("Missing PORT from environment");
}

const baseTopic = process.env.BASE_MQTT_PATH || "shairport-sync/rpih1/";
const mqttHost = process.env.MQTT_BROKER || "mqtt://hifi-office.local";

const cache = new NodeCache();
const spotifyClient = new SpotifyClient(cache, process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET);
const mqttClient = new MqttClient(mqttHost, baseTopic);

const server = httpServer(+process.env.PORT, spotifyClient, mqttClient);
gracefulShutdown(server, {onShutdown: () => mqttClient.close()});
