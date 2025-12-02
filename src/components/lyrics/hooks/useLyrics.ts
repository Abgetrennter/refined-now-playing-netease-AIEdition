import { useState, useEffect, useRef } from 'react';
import { LyricLine } from '../../../liblyric';
import { isFMSession } from '../utils';

export function useLyrics(isFM: boolean) {
	const [lyrics, setLyrics] = useState<LyricLine[] | null>(null);
	const _lyrics = useRef<LyricLine[] | null>(null);
	const _setLyrics = setLyrics;
    // @ts-ignore
	const setLyricsWrapper = ((x: any) => {
		_lyrics.current = x;
		_setLyrics(x);
	}) as any;

	const [hasTranslation, setHasTranslation] = useState(false);
	const [hasRomaji, setHasRomaji] = useState(false);
	const [hasKaraoke, setHasKaraoke] = useState(false);
	const [isUnsynced, setIsUnsynced] = useState(false); 
	const [lyricContributors, setLyricContributors] = useState(null);
    const shouldTransit = useRef(true);
    const [recalcCounter, setRecalcCounter] = useState(0);
    
    // Mappings
    const [allToNonInterludeLyricsMapping, setAllToNonInterludeLyricsMapping] = useState<number[]>([]);
	const [nonInterludeToAllLyricsMapping, setNonInterludeToAllLyricsMapping] = useState<number[]>([]);

    const isCurrentModeSession = () => { 
		return isFM ? isFMSession() : !isFMSession();
	}

    const preProcessMapping = (lyrics: any[]) => {
		lyrics ??= [];
		const allToNonInterlude: number[] = [], nonInterludeToAll: number[] = [];
		let cnt = 0;
		for (let i = 0; i < lyrics.length; i++) {
			const line = lyrics[i];
			if (line.isInterlude) {
				if (allToNonInterlude.length > 0) {
					allToNonInterlude.push(allToNonInterlude[allToNonInterlude.length - 1]);
				} else {
					allToNonInterlude.push(0);
				}
			} else {
				nonInterludeToAll.push(i);
				allToNonInterlude.push(cnt);
				cnt++;
			}
		}
		setAllToNonInterludeLyricsMapping(allToNonInterlude);
		setNonInterludeToAllLyricsMapping(nonInterludeToAll);
	}

    useEffect(() => {
        const onLyricsUpdate = (e: any) => {
            if (!e.detail) {
                return;
            }
            if (!isCurrentModeSession()) {
                return;
            }
            shouldTransit.current = false;
            preProcessMapping(e.detail.lyrics);
            
            // Reset state if not amending
            if (!e.detail.amend) {
                 // Logic to reset scrolling/current line handled in component or via returned state
            }
            
            setLyricsWrapper(e.detail.lyrics);
            setHasTranslation(e.detail.lyrics.some((x: any) => x.translatedLyric));
            setHasRomaji(e.detail.lyrics.some((x: any) => x.romanLyric));
            setHasKaraoke(e.detail.lyrics.some((x: any) => x.dynamicLyric));
            setIsUnsynced(e.detail?.unsynced ?? false);
            setLyricContributors(e.detail.contributors);
    
            if (e.detail.amend) {
                shouldTransit.current = true;
                setRecalcCounter(+ new Date());
            }
        }

		shouldTransit.current = false;
		// @ts-ignore
		if (window.currentLyrics) {
			// @ts-ignore
			const currentLyrics = window.currentLyrics.lyrics;
			preProcessMapping(currentLyrics);
			setLyricsWrapper(currentLyrics);
			setHasTranslation(currentLyrics.some((x: any) => x.translatedLyric));
			setHasRomaji(currentLyrics.some((x: any) => x.romanLyric));
			setHasKaraoke(currentLyrics.some((x: any) => x.dynamicLyric));
			setIsUnsynced(currentLyrics?.unsynced ?? false);
			// @ts-ignore
			setLyricContributors(window.currentLyrics.contributors);
		}
		document.addEventListener('lyrics-updated', onLyricsUpdate);
		return () => {
			document.removeEventListener('lyrics-updated', onLyricsUpdate);
		}
	}, []);

    useEffect(() => {
		const onRecalc = () => {
			setRecalcCounter(+ new Date());
		}
		window.addEventListener('recalc-lyrics', onRecalc);
		return () => {
			window.removeEventListener('recalc-lyrics', onRecalc);
		}
	}, []);

    return {
        lyrics,
        _lyrics,
        setLyrics: setLyricsWrapper,
        hasTranslation,
        hasRomaji,
        hasKaraoke,
        isUnsynced,
        lyricContributors,
        allToNonInterludeLyricsMapping,
        nonInterludeToAllLyricsMapping,
        shouldTransit,
        recalcCounter,
        setRecalcCounter
    };
}
