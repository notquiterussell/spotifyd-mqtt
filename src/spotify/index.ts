import got from "got";
import {DataCache} from "../cache/index.js";
import {Logger} from "winston";
import getLogger from "../logger/index.js";
import TrackObjectFull = SpotifyApi.TrackObjectFull;

interface AccessToken {
    access_token: string;
    token_type: string;
    expires_in: number;
}

export class SpotifyClient {
    private readonly cache: DataCache;
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly logger: Logger;

    public constructor(cache: DataCache, clientId: string, clientSecret: string) {
        this.cache = cache;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.logger = getLogger("SpotifyClient");
    }

    async getTrackDetails(trackId: string): Promise<TrackObjectFull | undefined> {
        try {
            const at = await this.getSpotifyKey();
            const {body} = await got.get<TrackObjectFull>(`https://api.spotify.com/v1/tracks/${trackId}`, {
                headers: {
                    "Authorization": `${at?.token_type} ${at?.access_token}`,
                },
                responseType: "json",
            });

            // Handle 404 - probably means we need to call the episode api instead

            return body;
        } catch (e: any) {
            this.logger.error(`Error ${e.message}`);
        }
    }

    private async getSpotifyKey(): Promise<AccessToken> {
        const cachedKey = this.cache.get<AccessToken>("spotify_key");
        if (cachedKey) {
            return cachedKey;
        }

        const usernamePassword = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
        let token;
        try {
            const {body} = await got.post<AccessToken>("https://accounts.spotify.com/api/token", {
                headers: {
                    "Authorization": `Basic ${usernamePassword}`,
                },
                form: {
                    grant_type: "client_credentials",
                },
                responseType: "json",
            });
            token = body;
        } catch (e: any) {
            this.logger.error(`Error getting token with ${this.clientId}`, e.message);
            throw e;
        }
        const expiresIn = token.expires_in - 100; // Give the token a bit of grace
        this.cache.set("spotify_key", token, expiresIn);
        return token;
    }
}

