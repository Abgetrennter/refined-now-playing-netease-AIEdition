import { useState, useEffect } from 'react';
import { getSetting } from '../../../modules/settings/storage';

export const useRefState = <T,>(initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>, React.RefObject<T>] => {
    const [value, setValue] = useState(initialValue);
    const ref = React.useRef(value);
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return [value, setValue, ref];
}

import React, { useMemo } from 'react';

export function useStyles() {
    const [fontSize, setFontSize] = useState<number>(parseInt(getSetting('lyric-font-size', '32') as string));
    const [lyricFade, setLyricFade] = useState<boolean>(getSetting('lyric-fade', false) as boolean);
    const [lyricZoom, setLyricZoom] = useState<boolean>(getSetting('lyric-zoom', false) as boolean);
    const [lyricBlur, setLyricBlur] = useState<boolean>(getSetting('lyric-blur', false) as boolean);
    const [lyricRotate, setLyricRotate] = useState<boolean>(getSetting('lyric-rotate', false) as boolean);
    const [RotateCurvature, setRotateCurvature] = useState<number>(parseInt(getSetting('lyric-rotate-curvature', '30') as string));
    const [showTranslation, setShowTranslation] = useState<boolean>(getSetting('show-translation', true) as boolean);
    const [showRomaji, setShowRomaji] = useState<boolean>(getSetting('show-romaji', true) as boolean);
    const [useKaraokeLyrics, setUseKaraokeLyrics] = useState<boolean>(getSetting('use-karaoke-lyrics', true) as boolean);
    const [karaokeAnimation, setKaraokeAnimation] = useState<string>(getSetting('karaoke-animation', 'float') as string);
    const [currentLyricAlignmentPercentage, setCurrentLyricAlignmentPercentage] = useState<number>(parseInt(getSetting('current-lyric-alignment-percentage', '50') as string));
    const [lyricStagger, setLyricStagger] = useState<boolean>(getSetting('lyric-stagger', true) as boolean);
    const [lyricGlow, setLyricGlow] = useState<boolean>(getSetting('lyric-glow', true) as boolean);

    const customOpacityFunc = localStorage.getItem('rnp-custom-opacity-func') ? new Function('offset', localStorage.getItem('rnp-custom-opacity-func')!) : null;
    const customBlurFunc = localStorage.getItem('rnp-custom-blur-func') ? new Function('offset', localStorage.getItem('rnp-custom-blur-func')!) : null;
    const customScaleFunc = localStorage.getItem('rnp-custom-scale-func') ? new Function('offset', localStorage.getItem('rnp-custom-scale-func')!) : null;


    useEffect(() => {
        const onLyricFontSizeChange = (e: any) => {
            setFontSize(parseInt(e.detail ?? '32'));
        }
        const onLyricFadeChange = (e: any) => {
            setLyricFade(e.detail ?? false);
        }
        const onLyricZoomChange = (e: any) => {
            setLyricZoom(e.detail ?? false);
        }
        const onLyricBlurChange = (e: any) => {
            setLyricBlur(e.detail ?? false);
        }
        const onLyricRotateChange = (e: any) => {
            setLyricRotate(e.detail ?? false);
        }
        const onRotateCurvatureChange = (e: any) => {
            setRotateCurvature(parseInt(e.detail ?? '30'));
        }
        const onKaraokeAnimationChange = (e: any) => {
            setKaraokeAnimation(e.detail ?? 'float');
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent("recalc-lyrics"));
            }, 0);
        }
        const onCurrentLyricAlignmentPercentageChange = (e: any) => {
            setCurrentLyricAlignmentPercentage(parseInt(e.detail) ?? 50);
        }
        const onLyricStaggerChange = (e: any) => {
            setLyricStagger(e.detail ?? true);
        }
        const onLyricGlowChange = (e: any) => {
            setLyricGlow(e.detail ?? true);
        }
        document.addEventListener("rnp-lyric-font-size", onLyricFontSizeChange);
        document.addEventListener("rnp-lyric-fade", onLyricFadeChange);
        document.addEventListener("rnp-lyric-zoom", onLyricZoomChange);
        document.addEventListener("rnp-lyric-blur", onLyricBlurChange);
        document.addEventListener("rnp-lyric-rotate", onLyricRotateChange);
        document.addEventListener("rnp-rotate-curvature", onRotateCurvatureChange);
        document.addEventListener("rnp-karaoke-animation", onKaraokeAnimationChange);
        document.addEventListener("rnp-current-lyric-alignment-percentage", onCurrentLyricAlignmentPercentageChange);
        document.addEventListener("rnp-lyric-stagger", onLyricStaggerChange);
        document.addEventListener("rnp-lyric-glow", onLyricGlowChange);
        return () => {
            document.removeEventListener("rnp-lyric-font-size", onLyricFontSizeChange);
            document.removeEventListener("rnp-lyric-fade", onLyricFadeChange);
            document.removeEventListener("rnp-lyric-zoom", onLyricZoomChange);
            document.removeEventListener("rnp-lyric-blur", onLyricBlurChange);
            document.removeEventListener("rnp-lyric-rotate", onLyricRotateChange);
            document.removeEventListener("rnp-rotate-curvature", onRotateCurvatureChange);
            document.removeEventListener("rnp-karaoke-animation", onKaraokeAnimationChange);
            document.removeEventListener("rnp-current-lyric-alignment-percentage", onCurrentLyricAlignmentPercentageChange);
            document.removeEventListener("rnp-lyric-stagger", onLyricStaggerChange);
            document.removeEventListener("rnp-lyric-glow", onLyricGlowChange);
        }
    }, []);

    return useMemo(() => ({
        fontSize,
        lyricFade,
        lyricZoom,
        lyricBlur,
        lyricRotate,
        RotateCurvature,
        showTranslation,
        showRomaji,
        useKaraokeLyrics,
        karaokeAnimation,
        currentLyricAlignmentPercentage,
        lyricStagger,
        lyricGlow,
        customOpacityFunc,
        customBlurFunc,
        customScaleFunc,
        setShowTranslation,
        setShowRomaji,
        setUseKaraokeLyrics
    }), [
        fontSize,
        lyricFade,
        lyricZoom,
        lyricBlur,
        lyricRotate,
        RotateCurvature,
        showTranslation,
        showRomaji,
        useKaraokeLyrics,
        karaokeAnimation,
        currentLyricAlignmentPercentage,
        lyricStagger,
        lyricGlow
    ]);
}
