#!/usr/bin/env node
import mqtt from "mqtt";

const client = mqtt.connect('mqtt://localhost');

const exhaustive = (event: never): never => {
    throw new Error(`Unknown event ${event}`)
}

interface SpotifydEvent {
    event: EventName,
    trackId?: string,
    oldTrackId?: string
}

interface TopicMessage {
    topic: string,
    message: string,
}

enum EventName {
    change = "change",
    start = "start",
    stop = "stop",
    load = "load",
    play = "play",
    pause = "pause",
    preload = "preload",
    endoftrack = "endoftrack",
    unavailable = "unavailable",
    preloading = "preloading",
}

const spotifyEvent: SpotifydEvent = {
    event: EventName[(process.env.PLAYER_EVENT || 'stop') as keyof typeof EventName],
    oldTrackId: process.env.OLD_TRACK_ID || "",
    trackId: process.env.TRACK_ID,
}

const blankTopicMessage = (topic: string): TopicMessage => {
    return {topic, message: "--"}
}

const topicMessage = (topic: string, message: string): TopicMessage => {
    return {topic, message}
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
            messages.push(blankTopicMessage("play_start"))
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
