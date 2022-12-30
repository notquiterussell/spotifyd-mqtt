import mqtt from "mqtt";
import {TopicMessage} from "../model/index.js";
import getLogger from "../logger/index.js";
import winston from "winston";

export interface CurrentTrack {
    currentTrackId: string;
}

export class MqttClient implements CurrentTrack {
    currentTrackId: string = "";
    private readonly client: mqtt.MqttClient;
    private readonly baseTopic: string;
    private logger: winston.Logger;

    constructor(hostname: string, baseTopic: string) {
        this.client = mqtt.connect(hostname);
        this.baseTopic = baseTopic;
        this.logger = getLogger("MQTT Handler");

        this.client.on("message", (topic, message) => {
            if (topic.endsWith("track_id")) {
                this.currentTrackId = message.toString("utf-8");
            }
        });
        this.client.on("connect", () => {
            this.client.subscribe(`${baseTopic}track_id`, {qos: 0, rh: 1}, (err, granted) => {
                if (err) {
                    this.logger.error(`Error subscribing ${err}`);
                } else {
                    this.logger.info(`Subscribed to ${granted.map(g => `${hostname}/${g.topic}`)}`);
                }
            });
        });
    }

    async publish(topicMessages: TopicMessage[]): Promise<void> {
        topicMessages.forEach(message => {
            this.client.publish(`${this.baseTopic}${message.topic}`, message.message, {retain: true});
        });
    }

    async close(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.end(false, {}, (err) => {
                if (err) {
                    this.logger.error(`Error closing MQTT session ${err.message}`);
                    return reject(err);
                }
                return resolve;
            });
        });
    }
}
