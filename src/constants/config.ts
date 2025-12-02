export const CONFIG_KEYS = {
    BACKGROUND_TYPE: 'background-type',
    ALBUM_SIZE: 'album-size',
    FLUID_MAX_FRAMERATE: 'fluid-max-framerate',
    LYRIC_OFFSET: 'lyric-offset',
    // Add other keys as needed
} as const;

export const DEFAULTS = {
    ALBUM_SIZE: 200,
    FLUID_MAX_FRAMERATE: 5,
    LYRIC_OFFSET: 0,
} as const;
