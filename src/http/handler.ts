import {EventName, SpotifydEvent, TopicMessage} from "../model/index.js";
import {blankTopicMessage, topicMessage} from "../topicHelpers.js";
import {SpotifyClient} from "../spotify/index.js";
import {CurrentTrack} from "../mqtt/index.js";

export const handle = async (
    e: SpotifydEvent,
    spotifyClient: SpotifyClient,
    ct: CurrentTrack,
): Promise<TopicMessage[]> => {
    const messages: TopicMessage[] = [];

    switch (e.event) {
        case EventName.stop:
            messages.push(blankTopicMessage("play_end"));
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
                if (e.trackId === ct.currentTrackId) {
                    messages.push(blankTopicMessage("play_resume"));
                } else {
                    const track = await spotifyClient.getTrackDetails(e.trackId);
                    if (track) {
                        messages.push(topicMessage("track_id", e.trackId));
                        messages.push(topicMessage("title", track.name));
                        messages.push(topicMessage("artist", track.artists.map(a => a.name).join(", ")));
                        messages.push(topicMessage("album", track.album.name));
                        messages.push(blankTopicMessage("play_start"));
                    }
                }
            }
            break;
        case EventName.pause:
            messages.push(blankTopicMessage("play_end"));
            break;
        case EventName.endoftrack:
            messages.push(blankTopicMessage("play_end"));
            break;
        case EventName.unavailable:
            messages.push(topicMessage("title", "Unavailable"));
            messages.push(blankTopicMessage("play_end"));
            break;
        case EventName.volumeset:
            break;
        default:
            console.log("Unknown event");
    }

    return messages;
};
