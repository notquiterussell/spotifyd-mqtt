const blankTopicMessage = (topic: string): TopicMessage => {
    return {topic, message: "--"}
}

const topicMessage = (topic: string, message: string): TopicMessage => {
    return {topic, message}
}
