#!/usr/bin/env node
import mqtt from "mqtt";
import dotenv from 'dotenv'
import path from "path";
import {EventName, SpotifydEvent, TopicMessage} from "./model.js";
import {blankTopicMessage, topicMessage} from "./topicHelpers.js";
import {SpotifyClient} from "./spotify.js";
import url from "url";

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
dotenv.config({path: path.resolve(__dirname, '.env')})

if (!process.env.SPOTIFY_CLIENT_ID) {
    throw "Missing SPOTIFY_CLIENT_ID from environment"
}
if (!process.env.SPOTIFY_CLIENT_SECRET) {
    throw "Missing SPOTIFY_CLIENT_SECRET from environment"
}

let trackId: string = ''
const client = mqtt.connect('mqtt://hifi-office.local');
client.subscribe("shairport-sync/rpih1/track_id", {qos: 0, rh: 1})
client.on('message', (topic, message) => {
    if (topic.endsWith("track_id")) {
        trackId = message.toString('utf-8')
        console.log(trackId)
    }
})

const exhaustive = (_: never): never => {
    throw new Error(`Unknown event ${process.env.PLAYER_EVENT}`)
}

// const result = await new SpotifyClient(process.env.SPOTIFY_CLIENT_ID || "", process.env.SPOTIFY_CLIENT_SECRET || "").getTrackDetails("07GvNcU1WdyZJq3XxP0kZa")
// console.log(result)

const spotifyEvent: SpotifydEvent = {
    event: EventName[(process.env.PLAYER_EVENT || 'stop') as keyof typeof EventName],
    oldTrackId: process.env.OLD_TRACK_ID || "",
    trackId: process.env.TRACK_ID,
}

const handle = async (e: SpotifydEvent): Promise<TopicMessage[]> => {
    const messages: TopicMessage[] = []

    switch (e.event) {
        case EventName.stop:
            messages.push(blankTopicMessage("play_end"))
            break;
        case EventName.load:
        // Deliberate fall through
        case EventName.change:
        // Deliberate fall through
        case EventName.start:
        // Deliberate fall through
        case EventName.preload:
        // Deliberate fall through
        case EventName.preloading:
        // Deliberate fall through
        case EventName.play:
            if (e.trackId) {
                if (e.trackId === trackId) {
                    console.log("Resuming " + e.trackId)
                    messages.push(blankTopicMessage("play_resume"))
                } else {
                    messages.push(topicMessage("track_id", e.trackId))

                    const track = await new SpotifyClient(process.env.SPOTIFY_CLIENT_ID || '', process.env.SPOTIFY_CLIENT_SECRET || '').getTrackDetails(e.trackId)
                    if (track) {
                        messages.push(topicMessage("title", track.name))
                        messages.push(topicMessage("artist", track.artists.map(a => a.name).join(", ")))
                        messages.push(topicMessage("album", track.album.name))
                    }
                    console.log("Playing " + e.trackId)
                    messages.push(blankTopicMessage("play_start"))
                }
            }
            break;
        case EventName.pause:
            messages.push(blankTopicMessage("play_end"))
            break;
        case EventName.endoftrack:
            messages.push(blankTopicMessage("play_end"))
            break;
        case EventName.unavailable:
            messages.push(topicMessage("title", "Unavailable"))
            messages.push(blankTopicMessage("play_end"))
            break;
        case EventName.volumeset:
            break;
        default:
            exhaustive(e.event)
    }

    return messages
}

client.on('connect', async () => {
    const topicMessages = await handle(spotifyEvent);
    topicMessages.forEach(message => {
        client.publish(`shairport-sync/rpih1/${message.topic}`, message.message, {retain: true})
    })
    client.end();
});
