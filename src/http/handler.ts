import {EventName, SpotifydEvent, TopicMessage} from "../model/index.js";
import {blankTopicMessage, topicMessage} from "./topicHelpers.js";
import {SpotifyClient} from "../spotify/index.js";
import {CurrentTrack} from "../mqtt/index.js";
import getLogger from "../logger/index.js";

export const handle = async (
    e: SpotifydEvent,
    spotifyClient: SpotifyClient,
    ct: CurrentTrack,
): Promise<TopicMessage[]> => {
    const logger = getLogger("Request handler");
    const messages: TopicMessage[] = [];

    switch (e.event) {
        case EventName.stop:
            messages.push(blankTopicMessage("play_end"));
            logger.info(`Stopping ${e.trackId}`);
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
                    logger.info(`Resuming ${e.trackId}`);
                } else {
                    const track = await spotifyClient.getTrackDetails(e.trackId);
                    if (track) {
                        messages.push(topicMessage("track_id", e.trackId));
                        messages.push(topicMessage("title", track.name));
                        messages.push(topicMessage("artist", track.artists.map(a => a.name).join(", ")));
                        messages.push(topicMessage("album", track.album.name));
                        messages.push(blankTopicMessage("play_start"));
                        logger.info(`Playing ${e.trackId}`);
                    }
                }
            } else {
                logger.info("No track id passed");
            }
            break;
        case EventName.pause:
            messages.push(blankTopicMessage("play_end"));
            logger.info(`Pausing ${e.trackId}`);
            break;
        case EventName.endoftrack:
            messages.push(blankTopicMessage("play_end"));
            logger.info(`End of ${e.trackId}`);
            break;
        case EventName.unavailable:
            messages.push(topicMessage("title", "Unavailable"));
            messages.push(blankTopicMessage("play_end"));
            logger.info(`Track ${e.trackId} is unavailable`);
            break;
        case EventName.volumeset:
            break;
        default:
            logger.error("Unknown event");
    }

    return messages;
};
