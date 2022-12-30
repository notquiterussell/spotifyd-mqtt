import winston, {Logger} from "winston";

export default function getLogger(name: string): Logger {
    const logger = winston.createLogger({
        level: process.env.LOG_LEVEL || "info",
        defaultMeta: {service: name},
        transports: [],
    });
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
    return logger;
}
