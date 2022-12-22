#!/usr/bin/env node
import mqtt from "mqtt";
import {EventName, SpotifydEvent, TopicMessage} from "./model";
import {blankTopicMessage, topicMessage} from "./topicHelpers";

const client = mqtt.connect('mqtt://localhost');

const exhaustive = (event: never): never => {
    throw new Error(`Unknown event ${event}`)
}

const spotifyEvent: SpotifydEvent = {
    event: EventName[(process.env.PLAYER_EVENT || 'stop') as keyof typeof EventName],
    oldTrackId: process.env.OLD_TRACK_ID || "",
    trackId: process.env.TRACK_ID,
}

const handle = (e: SpotifydEvent): TopicMessage[] => {
    const messages: TopicMessage[] = []

    if (e.trackId) {
        messages.push(topicMessage("track_id", e.trackId))
    }

    switch (e.event) {
        case EventName.change:
            messages.push(blankTopicMessage("play_start"))
            break;
        case EventName.start:
            messages.push(blankTopicMessage("play_start"))
            break;
        case EventName.stop:
            messages.push(blankTopicMessage("play_end"))
            break;
        case EventName.load:
            break;
        case EventName.play:
            if (e.trackId === e.oldTrackId) {
                messages.push(blankTopicMessage("play_resume"))
            } else {
                messages.push(blankTopicMessage("play_start"))
            }
            break;
        case EventName.pause:
            messages.push(blankTopicMessage("play_end"))
            break;
        case EventName.preload:
            break;
        case EventName.endoftrack:
            messages.push(blankTopicMessage("play_end"))
            break;
        case EventName.unavailable:
            messages.push(topicMessage("title", "Unavailable"))
            messages.push(blankTopicMessage("play_end"))
            break;
        case EventName.preloading:
            break;
        default:
            exhaustive(e.event)
    }

    return messages
}

client.on('connect', function () {
    const topicMessages = handle(spotifyEvent);
    topicMessages.forEach(message => {
        client.publish(`raspotify/rpih1/${message.topic}`, message.message)
    })
    client.end();
});
