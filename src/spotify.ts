import request from "request";
import TrackObjectFull = SpotifyApi.TrackObjectFull;


export class SpotifyClient {
    clientId: string;
    clientSecret: string;

    public constructor(client_id: string, client_secret: string) {
        this.clientId = client_id;
        this.clientSecret = client_secret
        console.log("id", client_id)
        console.log("secret", client_secret)
    }

    async getTrackDetails(trackId: string): Promise<TrackObjectFull | undefined> {
        const authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(this.clientId + ':' + this.clientSecret).toString('base64')),
            },
            form: {
                grant_type: 'client_credentials',
            },
            json: true,
        };

        request.post(authOptions, function (error, response, body) {
            if (!error && response.statusCode === 200) {

                // use the access token to access the Spotify Web API
                const token = body.access_token;
                console.log("Token")
                const options = {
                    url: `https://api.spotify.com/v1/tracks/${trackId}`,
                    headers: {
                        'Authorization': 'Bearer ' + token,
                    },
                    json: true,
                };
                request.get(options, function (error, response, body) {
                    return body
                });
            } else {
                console.log("error", error)
                console.log("response.statusCode", response.statusCode)
                console.log("Body", response.body)
            }
        });
        return undefined
    }
}
