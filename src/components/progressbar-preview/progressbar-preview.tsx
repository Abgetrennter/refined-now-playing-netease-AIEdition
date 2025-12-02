import React, { useState, useEffect, useRef, MutableRefObject } from 'react';
import './progressbar-preview.scss';
import { getSetting } from '../../utils/utils';
import { LyricLine, DynamicLyricWord } from '../../liblyric';

declare const legacyNativeCmder: any;

const isFMSession = () => {
    const fmPlayer = document.querySelector(".m-player-fm");
	return fmPlayer && !fmPlayer.classList.contains("f-dn");
}

if (getSetting('enable-progressbar-preview', true)) {
	document.body.classList.add('enable-progressbar-preview');
}

function useRefState<T>(initialValue: T): [MutableRefObject<T>, T, (val: T) => void] {
	const [value, setValue] = useState<T>(initialValue);
	const valueRef = useRef<T>(value);

	const updateValue = (val: T) => {
		valueRef.current = val;
		setValue(val);
	};

	return [valueRef, value, updateValue];
}

let totalLengthInit = 0;
if (typeof legacyNativeCmder !== 'undefined') {
    legacyNativeCmder.appendRegisterCall('Load', 'audioplayer',  (_: any, info: any) => {
        totalLengthInit = info.duration * 1000;
    });
}

function formatTime(time: number) {
    if (isNaN(time)) return '00:00';
	const h = Math.floor(time / 3600);
	const m = Math.floor((time - h * 3600) / 60);
	const s = Math.floor(time - h * 3600 - m * 60);
	return `${h ? `${h}:` : ''}${m < 10 ? `0${m}` : m}:${s < 10 ? `0${s}` : s}`;
}

interface ProgressbarPreviewProps {
    isFM: boolean;
    dom: HTMLElement | null;
}

export function ProgressbarPreview(props: ProgressbarPreviewProps) {
	const isCurrentModeSession = () => { // 判断是否在当前模式播放 (普通/FM)
		return props.isFM ? isFMSession() : !isFMSession();
	}

	const [visible, setVisible] = useState(false);

	const xRef = useRef(0);
    const yRef = useRef(0);

	const progressBarRef = useRef<HTMLElement | null>(null);
	useEffect(() => {
		progressBarRef.current = props.dom;
	}, [props.dom]);

	const [_lyrics, lyrics, setLyrics] = useRefState<LyricLine[] | null>(null);
	const [nonInterludeCount, setNonInterludeCount] = useState(0);

	const hoverPercentRef = useRef(0);
	const [currentLine, setCurrentLine] = useState(0);
	const [currentNonInterludeIndex, setCurrentNonInterludeIndex] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);

	const [_totalLength, totalLength, setTotalLength] = useRefState(totalLengthInit);

	const containerRef = useRef<HTMLDivElement>(null);

	const subprogressbarInnerRef = useRef<HTMLDivElement>(null);

	const onLyricsUpdate = (e: any) => {
		if (!isCurrentModeSession()) {
			return;
		}
		if (!e.detail) {
			return;
		}
		setLyrics(e.detail.lyrics);
		setNonInterludeCount(e.detail.lyrics.filter((l: LyricLine) => l.originalLyric).length);
	}
	useEffect(() => {
		if (window.currentLyrics) {
			if (!isCurrentModeSession()) {
				return;
			}
			const currentLyrics = window.currentLyrics.lyrics;
			setLyrics(currentLyrics);
			setNonInterludeCount(currentLyrics.filter((l: LyricLine) => l.originalLyric).length);
		}
		document.addEventListener('lyrics-updated', onLyricsUpdate);
		return () => {
			document.removeEventListener('lyrics-updated', onLyricsUpdate);
		}
	}, []);


	const onLoad = (_: any, info: any) => {
		setTotalLength(info.duration * 1000);
	}
	useEffect(() => {
		legacyNativeCmder.appendRegisterCall('Load', 'audioplayer', onLoad);
		return () => {
			legacyNativeCmder.removeRegisterCall('Load', 'audioplayer', onLoad);
		}
	}, []);

	const updateHoverPercent = () => {
		if (!progressBarRef.current) {
			return;
		}
		const rect = progressBarRef.current.getBoundingClientRect();
		const percent = (xRef.current - rect.left) / rect.width;
		hoverPercentRef.current = percent;
		const currentTimeVal = _totalLength.current * percent;
		setCurrentTime(currentTimeVal);
		if (_lyrics.current) {
			let cur = 0;
			let nonInterludeIndex = 0;
			for (let i = 0; i < _lyrics.current.length; i++) {
				if (_lyrics.current[i].time <= currentTimeVal) {
					cur = i;
					if (_lyrics.current[i].originalLyric) {
						nonInterludeIndex++;
					}
				} else {
					break;
				}
			}
			if (
				cur == _lyrics.current.length - 1 &&
				_lyrics.current[cur].duration &&
				currentTimeVal > _lyrics.current[cur].time + _lyrics.current[cur].duration + 500
			) {
				cur = _lyrics.current.length;
			}
			setCurrentLine(cur);
			setCurrentNonInterludeIndex(Math.max(nonInterludeIndex, 1));
			if (subprogressbarInnerRef.current) {
				let duration =  _lyrics.current[cur]?.duration;
				if (duration == 0) {
					duration = _totalLength.current - _lyrics.current[cur].time;
				}
				subprogressbarInnerRef.current.style.width = (currentTimeVal - _lyrics.current[cur].time) / duration * 100 + '%';
			}
		}
	};
	const updatePosition = () => {
		if (!containerRef.current) {
			return;
		}
		const width = containerRef.current.clientWidth;
		const height = containerRef.current.clientHeight;
        if (!progressBarRef.current) return;
		const rect = progressBarRef.current.getBoundingClientRect();
		let left = xRef.current - width / 2;
		if (left < 0) {
			left = 0;
		}
		if (left + width > window.innerWidth) {
			left = window.innerWidth - width;
		}
		containerRef.current.style.left = left + 'px';
		containerRef.current.style.top = (rect.top - height - 5) + 'px';
	};
	useEffect(() => {
		updatePosition();
	}, [visible, currentLine]);
	

	const onMouseEnter = (e: MouseEvent) => {
		setVisible(true);
		xRef.current = e.clientX;
		yRef.current = e.clientY;
		updateHoverPercent();
		updatePosition();
	};
	const onMouseLeave = (e: MouseEvent) => {
		setVisible(false);
	};
	const onMouseMove = (e: MouseEvent) => {
		xRef.current = e.clientX;
		yRef.current = e.clientY;
		updateHoverPercent();
		updatePosition();
	};
	useEffect(() => {
		if (!progressBarRef.current) {
			return;
		}
		progressBarRef.current.addEventListener('mouseenter', onMouseEnter);
		progressBarRef.current.addEventListener('mouseleave', onMouseLeave);
		progressBarRef.current.addEventListener('mousemove', onMouseMove);
		return () => {
            if (progressBarRef.current) {
                progressBarRef.current.removeEventListener('mouseenter', onMouseEnter);
                progressBarRef.current.removeEventListener('mouseleave', onMouseLeave);
                progressBarRef.current.removeEventListener('mousemove', onMouseMove);
            }
		}
	}, [progressBarRef.current]); // Dependencies check: might want to be careful with ref dependency.
    // In React, refs are stable, but progressBarRef.current can change. 
    // However, since we set it via props.dom in an effect, and props.dom might change, 
    // we should probably depend on props.dom instead or stick to the current logic if we trust it.
    // But `useEffect` with `progressBarRef.current` in dependency array is generally discouraged because ref mutation doesn't trigger re-render.
    // Better to use a callback ref or just rely on `props.dom` directly if possible.
    // Since `progressBarRef.current` is set from `props.dom`, let's just use `props.dom` in dependency if we changed the logic to attach directly to `props.dom`.
    // But here `progressBarRef` is a ref to an element passed from props.
    // Let's assume the structure of the original code which attaches listeners to `progressBarRef.current`.
    // If `props.dom` changes, `progressBarRef.current` is updated in the first `useEffect`.
    // But the second `useEffect` (listeners) depends on `progressBarRef.current` which won't trigger.
    // It should depend on `props.dom`.
    
    // Let's correct the dependency of the listener effect.
    
    useEffect(() => {
        const el = props.dom;
        if (!el) return;
        
        // We need to wrap handlers to preserve `this` or closure if needed, but here they are arrow functions.
        el.addEventListener('mouseenter', onMouseEnter);
        el.addEventListener('mouseleave', onMouseLeave);
        el.addEventListener('mousemove', onMouseMove);
        return () => {
            el.removeEventListener('mouseenter', onMouseEnter);
            el.removeEventListener('mouseleave', onMouseLeave);
            el.removeEventListener('mousemove', onMouseMove);
        }
    }, [props.dom, visible, currentLine, lyrics, totalLength]); // Added dependencies used inside handlers to be safe, although refs are used for mutable state. 
    // Actually, the handlers use refs (xRef, yRef, _lyrics, _totalLength) mostly, so they are stable-ish.
    // But `setVisible` and `updatePosition` are called.
    // Let's stick to `props.dom` as the main trigger for attachment.

	
	const isPureMusic = lyrics && (
		lyrics.length === 1 ||
		lyrics.length <= 10 && lyrics.some((x) => (x.originalLyric ?? '').includes('纯音乐')) ||
		document.querySelector('#main-player')?.getAttribute('data-log')?.includes('"s_ctype":"voice"') ||
		(lyrics[0] as any)?.unsynced
	);

	return (
		<div
			ref={containerRef}
			className={`progressbar-preview ${(visible && !isPureMusic) ? '' : 'invisible'}`}
		>
			{
				lyrics && lyrics[currentLine]?.originalLyric && (
					<div className="progressbar-preview-number">{currentNonInterludeIndex} / {nonInterludeCount}</div>
				)
			}
			{
				lyrics && lyrics[currentLine]?.dynamicLyric && (
					<div className="progressbar-preview-line-karaoke">
						{
							lyrics[currentLine].dynamicLyric.map((word, i) => {
								const percent = (currentTime - word.time) / word.duration;
								return (<span
									key={i}
									className={`progressbar-preview-line-karaoke-word ${percent >= 0 && percent <= 1 ? 'current' : ''} ${percent <0 ? 'upcoming' : ''}`}
									style={{
										// @ts-ignore
										'-webkit-mask-position': `${100 * (1 - Math.max(0, Math.min(1, (currentTime - word.time) / word.duration)))}%`,
									}}
								>
									{word.word}
								</span>);
							})
						}
					</div>
				)
			}
			{
				lyrics && !lyrics[currentLine]?.dynamicLyric && lyrics[currentLine]?.originalLyric && (
					<div className="progressbar-preview-line-original">{lyrics[currentLine]?.originalLyric}</div>
				)
			}
			{
				lyrics && lyrics[currentLine]?.originalLyric == '' && (
					<div className="progressbar-preview-line-original">♪</div>
				)
			}
			{
				lyrics && lyrics[currentLine]?.translatedLyric && (
					<div className="progressbar-preview-line-translated">{lyrics[currentLine]?.translatedLyric}</div>
				)
			}
			{
				lyrics && lyrics[currentLine] && (
					<div className="progressbar-preview-subprogressbar">
						<div className="progressbar-preview-subprogressbar-inner" ref={subprogressbarInnerRef}></div>
					</div>
				)
			}
			{
				lyrics && lyrics[currentLine] && (
					<div className="progressbar-preview-line-time">
						<div>{formatTime(lyrics[currentLine]?.time / 1000)}</div>
						<div>{lyrics[currentLine]?.duration > 0 ? formatTime((lyrics[currentLine]?.time + lyrics[currentLine]?.duration) / 1000) : formatTime(totalLength / 1000)}</div>
					</div>
				)
			}
		</div>
	);
}
