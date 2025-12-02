import { useState, useEffect, useRef, useCallback } from 'react';
import { isFMSession } from '../utils';
import { useRefState } from './useStyles';
import { getSetting } from '../../../modules/settings/storage';
import { LyricLine } from '../../../liblyric';

declare const legacyNativeCmder: any;
declare const channel: any;
declare const loadedPlugins: any;

export function usePlayback(
    isFM: boolean, 
    _lyrics: React.MutableRefObject<LyricLine[] | null>, 
    shouldTransit: React.MutableRefObject<boolean>,
    lyricStagger: boolean,
    setScrollingMode: (mode: boolean) => void,
    _scrollingMode: React.MutableRefObject<boolean>,
    setScrollingFocusLine: (line: number) => void,
    _scrollingFocusLine: React.MutableRefObject<number>,
    setCurrentLine: (line: number) => void,
    setCurrentLineForScrolling: (line: number) => void,
    _currentLine: React.MutableRefObject<number>,
    _playState: React.MutableRefObject<boolean>
) {
    const getPlayState = () => {
		if (!isFM) {
			return document.querySelector("#main-player .btnp")?.classList.contains("btnp-pause") ?? true;
		} else {
			return document.querySelector(".m-player-fm .btnp")?.classList.contains("btnp-pause") ?? true;
		}
	}

    const [playState, setPlayState] = useState(getPlayState());
	const [songId, setSongId] = useState("0");
	const currentTime = useRef(0); 
	const [seekCounter, setSeekCounter] = useState(0); 
    
    const [globalOffset, setGlobalOffset, _globalOffset] = useRefState(parseInt(getSetting('lyric-offset', '0') as string));

    const isCurrentModeSession = () => { 
		return isFM ? isFMSession() : !isFMSession();
	}

    const onPlayStateChange = (id: any, state: any) => {
		if (!isCurrentModeSession()) {
			return;
		}
		_playState.current = getPlayState();
		setPlayState(_playState.current);
		if (document.querySelector(".m-player-fm .btnp")?.classList.contains("btnp-pause")) {
			setCurrentLineForScrolling(_currentLine.current);
		}
		setSongId(id);
	};

    const onPlayProgress = (id: any, progress: any) => {
		if (!isCurrentModeSession()) {
			return;
		}
		if (loadedPlugins['LibFrontendPlay'] && loadedPlugins['LibFrontendPlay'].enabled && loadedPlugins['LibFrontendPlay']?.currentAudioPlayer) {
			progress = loadedPlugins['LibFrontendPlay'].currentAudioPlayer.currentTime;
		}
		
		const lastTime = currentTime.current + _globalOffset.current;
		currentTime.current = ((progress * 1000) || 0);
		const currentTimeWithOffset = currentTime.current + _globalOffset.current;
		if (!_lyrics.current) return;
		let startIndex = 0;
		if (currentTimeWithOffset - lastTime > 0 && currentTimeWithOffset - lastTime < 50) {
			startIndex = Math.max(0, _currentLine.current - 1);
		}
		if (currentTimeWithOffset < lastTime - 10) {
			setSeekCounter(+new Date());
		}

		let cur = 0;
		for (let i = startIndex; i < _lyrics.current.length; i++) {
			if (_lyrics.current[i].time <= currentTimeWithOffset) {
				cur = i;
			} else {
				break;
			}
		}
		if (
			cur == _lyrics.current.length - 1 &&
			// @ts-ignore
			_lyrics.current[cur].duration &&
			// @ts-ignore
			currentTimeWithOffset > _lyrics.current[cur].time + _lyrics.current[cur].duration + 500
		) {
			cur = _lyrics.current.length;
		}

		let curForScrolling = Math.max(0, cur - 1);
		const scrollingDelay = lyricStagger ? 200 : 0;
		for (let i = startIndex; i < _lyrics.current.length; i++) {
			if (_lyrics.current[i].time <= currentTimeWithOffset + scrollingDelay) {
				curForScrolling = i;
			} else {
				break;
			}
		}

		shouldTransit.current = true;
		if (!_scrollingMode.current) {
			setScrollingFocusLine(cur);
			_scrollingFocusLine.current = cur;
		}
		setCurrentLine(cur);
		setCurrentLineForScrolling(curForScrolling);
	};

    useEffect(() => {
		legacyNativeCmder.appendRegisterCall("PlayState", "audioplayer", onPlayStateChange);
		legacyNativeCmder.appendRegisterCall("PlayProgress", "audioplayer", onPlayProgress);
		const _channalCall = channel.call;
		channel.call = (name: any, ...args: any) => {
			if (name == "audioplayer.seek") {
				if (isCurrentModeSession()) {
					currentTime.current = Math.floor(args[1][2] * 1000);
					setScrollingMode(false);
					setSeekCounter(+new Date());
				}
			}
			_channalCall(name, ...args);
		};
		return () => {
			legacyNativeCmder.removeRegisterCall("PlayState", "audioplayer", onPlayStateChange);
			legacyNativeCmder.removeRegisterCall("PlayProgress", "audioplayer", onPlayProgress);
			channel.call = _channalCall;
		}
	}, []);

    useEffect(() => {
        const onGlobalOffsetChange = (e: any) => {
			setGlobalOffset(parseInt(e.detail) ?? 0);
			setSeekCounter(+new Date());
		}
		document.addEventListener("rnp-global-offset", onGlobalOffsetChange);
		return () => {
			document.removeEventListener("rnp-global-offset", onGlobalOffsetChange);
		}
    }, []);

    const jumpToTime = useCallback((time: number) => {
		time -= _globalOffset.current;
		shouldTransit.current = true;
		setScrollingMode(false);
		
		channel.call("audioplayer.seek", () => { }, [
			songId,
			`${songId}|seek|${Math.random().toString(36).substring(6)}`,
			time / 1000,
		]);
		
		setSeekCounter(+new Date());
		if (!playState) {
			if (!isFM) (document.querySelector("#main-player .btnp") as HTMLElement)?.click();
			else (document.querySelector(".m-player-fm .btnp") as HTMLElement)?.click();
		}
	}, [songId, playState, globalOffset]);

    return {
        playState,
        _playState,
        songId,
        currentTime,
        seekCounter,
        globalOffset,
        jumpToTime
    };
}
