export default () => ({

    "change": () => {
    },

    "start": () => {
        "play_start"
    },

    "stop": () => {
        "play_end"
    },

    "load": () => {
    },

    "play": () => {
        "play_start"
    },

    "pause": {},

    "preload": {},

    "endoftrack": () => {
        "play_end"
    },

    "unavailable": {},

    "preloading": {},
})
