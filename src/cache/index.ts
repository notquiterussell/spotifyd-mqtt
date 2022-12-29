type Key = string | number;

export interface DataCache {
    get<T>(key: Key): T | undefined;


    set<T>(key: Key, value: T, ttl?: number): void;
}
