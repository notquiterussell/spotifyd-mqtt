import mqtt from "mqtt";
import {TopicMessage} from "../model/index.js";

export interface CurrentTrack {
    currentTrackId: string;
}

export class MqttClient implements CurrentTrack {
    currentTrackId: string = "";
    private readonly client: mqtt.MqttClient;
    private readonly baseTopic: string;

    constructor(hostname: string, baseTopic: string) {
        this.client = mqtt.connect(hostname);
        this.client.subscribe(`${baseTopic}/track_id`, {qos: 0, rh: 1});
        this.baseTopic = baseTopic;

        this.client.on("message", (topic, message) => {
            if (topic.endsWith("track_id")) {
                this.currentTrackId = message.toString("utf-8");
            }
        });
    }

    async publish(topicMessages: TopicMessage[]): Promise<void> {
        topicMessages.forEach(message => {
            this.client.publish(`${this.baseTopic}${message.topic}`, message.message, {retain: true});
        });
    }

    async close(): Promise<void> {
        this.client.end();
    }
}
