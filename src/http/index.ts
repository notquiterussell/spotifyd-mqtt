import {SpotifyClient} from "../spotify/index.js";
import * as http from "http";
import express from "express";
import {EventName, SpotifydEvent} from "../model/index.js";
import * as core from "express-serve-static-core";
import {handle} from "./handler.js";
import {MqttClient} from "../mqtt/index.js";
import HttpStatus from "http-status-codes";
import getLogger from "../logger/index.js";

type SpotifydQueryParams = {
    trackId?: string;
    oldTrackId?: string;
};

export const httpServer = (port: number, spotifyClient: SpotifyClient, mqtt: MqttClient): http.Server => {
    const app = express();
    const logger = getLogger("HTTP Server");

    app.get("/:event", async (req: express.Request<core.ParamsDictionary, {}, {}, SpotifydQueryParams>, res) => {
        const event = req.params.event;
        const trackId = req.query.trackId;
        const oldTrackId = req.query.oldTrackId;

        const spotifyEvent: SpotifydEvent = {
            event: EventName[event as keyof typeof EventName],
            oldTrackId,
            trackId,
        };

        const topicMessages = await handle(spotifyEvent, spotifyClient, mqtt);
        await mqtt.publish(topicMessages);

        res.sendStatus(HttpStatus.ACCEPTED);
    });

    return app.listen(port, () => {
        logger.info(`Listening on ${port}`);
    });
};
