# HTTP Spotify Client

## Introduction

A simple client to convert a spotify ID into a series of MQTT topics.

It was developed to replace Shairport-sync with Spotifyd, publishing to a subset of the Shairport-sync
topics.

### Topics

| Topic name  | Description                       |
|-------------|-----------------------------------|
| play_end    | Current track has stopped playing |
| play_resume | Current track is resumed          |
| play_start  | Current track is starting         |
| track_id    | Track id                          |
| title       | Track title                       |
| artist      | Track artist                      |
| album       | Track album                       |

Generally, the order of events will be publication on `title`, `artist` and `album`. Then one of the control
signals, `play_end`, `play_resume` or `play_start` will be sent `--`.

## Environment variables

To register with Spotify, login and visit: https://developer.spotify.com

| Variable              | Description                                    | Default                  |
|-----------------------|------------------------------------------------|--------------------------|
| SPOTIFY_CLIENT_ID     | Your Spotify application ID                    | -                        |
| SPOTIFY_CLIENT_SECRET | Your client secret, from the Spotify dashboard | -                        |
| PORT                  | The port to listen on                          | -                        |
| MQTT_BROKER           | Broker address                                 | mqtt://hifi-office.local |
| BASE_MQTT_PATH        | Base path                                      | shairport-sync/rpih1/    |

## Building

`make && make install`

## Installing
