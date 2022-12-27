import got from "got";
import {FileSystemCache} from "file-system-cache";
import TrackObjectFull = SpotifyApi.TrackObjectFull;

interface AccessToken {
    access_token: string,
    token_type: string,
    expires_in: number,
    expires_at: number, // UTC ms
}


export class SpotifyClient {
    clientId: string;
    clientSecret: string;

    public constructor(client_id: string, client_secret: string) {
        this.clientId = client_id;
        this.clientSecret = client_secret
    }

    async getTrackDetails(trackId: string): Promise<TrackObjectFull> {
        try {
            const at = await this.getSpotifyKey()
            return got.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
                headers: {
                    'Authorization': `${at?.token_type} ${at?.access_token}`,
                },
            }).json()
        } catch (e: any) {
            console.log("Error", e.request.body)
            throw e
        }
    }

    private async getSpotifyKey(): Promise<AccessToken> {
        const cache = new FileSystemCache()
        const now = new Date()
        const cachedKey = cache.getSync("spotify_key") as AccessToken
        if (cachedKey && now.valueOf() < cachedKey.expires_at) {
            return cachedKey
        }

        const at: AccessToken = await got.post('https://accounts.spotify.com/api/token', {
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(this.clientId + ':' + this.clientSecret).toString('base64')),
            },
            form: {
                grant_type: 'client_credentials',
            },
        }).json<AccessToken>();
        now.setSeconds(now.getSeconds() + at.expires_in - 100)
        at.expires_at = now.valueOf()
        await cache.set("spotify_key", at)
        return at
    }
}

