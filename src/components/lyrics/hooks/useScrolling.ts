import { useState, useRef, useCallback, useEffect } from 'react';
import { LyricLine } from '../../../liblyric';

export function useScrolling(
    containerRef: React.RefObject<HTMLDivElement | null>,
    _lyrics: React.RefObject<LyricLine[] | null>,
    shouldTransit: React.RefObject<boolean>,
    _currentLine: React.RefObject<number>,
    _playState: React.RefObject<boolean>,
    currentLine: number
) {
    let [scrollingMode, setScrollingMode] = useState(false);
	const [scrollingFocusLine, setScrollingFocusLine] = useState(0);
	const _scrollingMode = useRef(false);
	const _scrollingFocusLine = useRef(0);
	const exitScrollingModeTimeout = useRef<any>(null);
	const _setScrollingMode = setScrollingMode;
    // @ts-ignore
	setScrollingMode = (x) => {
		_scrollingMode.current = x as boolean;
		if (containerRef.current) {
			if (x) containerRef.current.classList.add('scrolling');
			else containerRef.current.classList.remove('scrolling');
		}
		_setScrollingMode(x);
	}

    const cancelExitScrollingModeTimeout = useCallback(() => {
		if (exitScrollingModeTimeout.current) {
			clearTimeout(exitScrollingModeTimeout.current);
			exitScrollingModeTimeout.current = null;
		}
	}, []);

    const exitScrollingModeSoon = useCallback((timeout = 2500) => {
		cancelExitScrollingModeTimeout();
		if (!_playState.current) return;
		exitScrollingModeTimeout.current = setTimeout(() => {
			setScrollingMode(false);
			setScrollingFocusLine(_currentLine.current);
			shouldTransit.current = true;
			_scrollingFocusLine.current = _currentLine.current;
		}, timeout);
	}, [currentLine]);

    const scrollingFocusOnLine = useCallback((line: number) => {
		if (line == null) return;
		shouldTransit.current = true;
		setScrollingMode(true);
		setScrollingFocusLine(line);
		_scrollingFocusLine.current = line;
	}, []);

    const onWheel = (e: WheelEvent) => {
		if (!_lyrics.current) return false;
		if (e.deltaY > 0) {
			for (let target = _scrollingFocusLine.current + 1; target < _lyrics.current.length; target++) {
				// @ts-ignore
				if (!_lyrics.current[target].isInterlude) {
					scrollingFocusOnLine(target);
					break;
				}
			}
			exitScrollingModeSoon();
		} else if (e.deltaY < 0) {
			for (let target = _scrollingFocusLine.current - 1; target >= 0; target--) {
				// @ts-ignore
				if (!_lyrics.current[target].isInterlude) {
					scrollingFocusOnLine(target);
					break;
				}
			}
			exitScrollingModeSoon();
		}
		return false;
	};

    useEffect(() => {
		if (!containerRef.current) return;
		containerRef.current.addEventListener("scroll", (e) => {
			e.stopPropagation();
			e.preventDefault();
			return false;
		}, { passive: false });
		containerRef.current.addEventListener("wheel", (e) => {
			e.stopPropagation();
			e.preventDefault();
			onWheel(e);
			return false;
		}, { passive: false });
	}, []);

	useEffect(() => {
		const onMouseLeave = () => {
			exitScrollingModeSoon(0);
		}
		document.addEventListener("mouseleave", onMouseLeave);
		return () => {
			document.removeEventListener("mouseleave", onMouseLeave);
		}
	}, []);

    return {
        scrollingMode,
        setScrollingMode,
        scrollingFocusLine,
        setScrollingFocusLine,
        _scrollingMode,
        _scrollingFocusLine,
        exitScrollingModeSoon,
        scrollingFocusOnLine
    };
}
