import React, { createContext, useContext } from 'react';

export interface LyricsContextValue {
    seekCounter: number;
    playState: boolean;
    showTranslation: boolean;
    showRomaji: boolean;
    useKaraokeLyrics: boolean;
    karaokeAnimation: string;
    lyricGlow: boolean;
    jumpToTime: (time: number) => void;
    reportHeight: (index: number, height: number) => void;
}

export const LyricsContext = createContext<LyricsContextValue | null>(null);

export const useLyricsContext = () => {
    const context = useContext(LyricsContext);
    if (!context) {
        throw new Error('useLyricsContext must be used within a LyricsProvider');
    }
    return context;
};
