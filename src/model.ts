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
