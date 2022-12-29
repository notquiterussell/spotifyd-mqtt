import {TopicMessage} from "./model/index.js";

export const blankTopicMessage = (topic: string): TopicMessage => {
    return {topic, message: "--"}
}

export const topicMessage = (topic: string, message: string): TopicMessage => {
    return {topic, message}
}
