import React, { useEffect, useRef } from 'react';
import { LineProps, InterludeProps } from './types';
import { DynamicLyricWord } from '../../liblyric';
import { copyTextToClipboard } from '../../utils/dom';
import { showContextMenu } from '../context-menu/context-menu';
import { useLyricsContext } from './LyricsContext';

function Interlude(props: InterludeProps) {
	const dotContainerRef = useRef<HTMLDivElement>(null);
    const { seekCounter, playState } = useLyricsContext();

	const dotCount = 3;
	const perDotTime = parseInt(String(props.line.duration / dotCount));
	const dots = [];
	for (let i = 0; i < dotCount; i++) {
		dots.push({
			time: props.line.time + perDotTime * i,
			duration: perDotTime,
		});
	}
	const dotAnimation = (dot: any) => {
		if (dotContainerRef.current) dotContainerRef.current.classList.add('pause-breath');
		if (props.currentLine != props.id) {
			return {
				transitionDuration: `200ms`,
				transitionDelay: `0ms`,
			};
		}
		if (playState == false && dot.time + dot.duration - props.currentTime > 0) {
			return {
				transitionDuration: `0s`,
				transitionDelay: `0ms`,
				opacity: Math.max(0.2 + 0.7 * (props.currentTime - dot.time) / dot.duration, 0.2),
				transform: `scale(${Math.max(0.9 + 0.1 * (props.currentTime - dot.time) / dot.duration * 2, 0.8)}px)`
			};
		}
		if (dotContainerRef.current) dotContainerRef.current.classList.remove('pause-breath');
		return {
			transitionDuration: `${dot.duration}ms, ${dot.duration + 150}ms`,
			transitionDelay: `${dot.time - props.currentTime}ms`
		};
	};

	useEffect(() => {
		if (props.currentLine != props.id) return;
		if (!dotContainerRef.current) return;
		dotContainerRef.current.classList.add('force-refresh');
		setTimeout(() => {
			dotContainerRef.current?.classList?.remove('force-refresh');
		}, 6);
	}, [seekCounter]);

	return (
		<div className="rnp-interlude-inner" ref={dotContainerRef}>
			{dots.map((dot, index) => {
				return <div
					key={index}
					className="rnp-interlude-dot"
					style={dotAnimation(dot)}
				/>
			})}
		</div>
	)
}

const LineContent = React.memo((props: LineProps & { lineRef: React.RefObject<HTMLDivElement | null>; outOfRangeKaraoke: boolean }) => {
    const {
        playState,
        showTranslation,
        showRomaji,
        useKaraokeLyrics,
        karaokeAnimation,
        lyricGlow,
        jumpToTime,
        seekCounter
    } = useLyricsContext();

	if (props.line.originalLyric == '') {
		// @ts-ignore
		props.line.isInterlude = true;
	}
	const offset = props.id - props.currentLine;
	const karaokeAnimationFloat = (word: DynamicLyricWord) => {
		if (props.currentLine != props.id) {
			return {
				transitionDuration: `200ms`,
				transitionDelay: `0ms`,
			};
		}
		if (playState == false && word.time + word.duration - props.currentTime > 0) {
			return {
				transitionDuration: `0s`,
				transitionDelay: `0ms`,
				opacity: Math.max(0.4 + 0.6 * (props.currentTime - word.time) / word.duration, 0.4),
				transform: `translateY(-${Math.max((props.currentTime - word.time) / word.duration * 2, 0)}px)`
			};
		}
		return {
			transitionDuration: `${word.duration}ms, ${word.duration + 150}ms`,
			transitionDelay: `${word.time - props.currentTime}ms`
		};
	};
	const karaokeAnimationSlide = (word: DynamicLyricWord) => {
		if (props.currentLine != props.id) {
			return {
				transitionDuration: `0ms, 0ms, 0.5s`,
				transitionDelay: `0ms`,
			};
		}
		if (playState == false && word.time + word.duration - props.currentTime > 0) {
			return {
				transitionDuration: `0s, 0s, 0.5s`,
				transitionDelay: `0ms`,
				transform: `translateY(-${Math.max((props.currentTime - word.time) / word.duration * 1, 0)}px)`,
				WebkitMaskPositionX: `${100 - Math.max((props.currentTime - word.time) / word.duration * 100, 0)}%`
			};
		}
		return {
			transitionDuration: `${word.duration}ms, ${word.duration * 0.8}ms, 0.5s`,
			transitionDelay: `${word.time - props.currentTime}ms, ${word.time - props.currentTime + word.duration * 0.5}ms, 0ms`
		};
	};
	const getKaraokeAnimation = (word: DynamicLyricWord) => {
		if (karaokeAnimation == 'float') {
			return karaokeAnimationFloat(word);
		} else if (karaokeAnimation == 'slide') {
			return karaokeAnimationSlide(word);
		}
	};

	const karaokeLineRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (props.currentLine != props.id) return;
		if (!karaokeLineRef.current) return;
		karaokeLineRef.current.classList.add('force-refresh');
		setTimeout(() => {
			if (!karaokeLineRef.current) return;
			karaokeLineRef.current.classList.remove('force-refresh');
		}, 6);
	}, [useKaraokeLyrics, seekCounter, karaokeAnimation]);


	const glowAnimationsRef = useRef<any[]>([]);
	useEffect(() => {
		if (!lyricGlow) return;

		if (!props.line?.dynamicLyric) return;

		const trailingIndexes = [];
		for (let i = 0; i < props.line.dynamicLyric.length; i++) {
			if (props.line.dynamicLyric[i]?.trailing) {
				trailingIndexes.push(i);
			}
		}
		if (trailingIndexes.length == 0) return;

		const glowAnimation = (index: number) => {
			if (!karaokeLineRef.current?.children[index]) return null;
			// @ts-ignore
			const fadeIn = props.line.dynamicLyric[index].duration * 0.6;
			// @ts-ignore
			const keep = props.line.dynamicLyric[index].duration * 0.4;
			const fadeAway = 500;
			const duration = fadeIn + keep + fadeAway;
			const glowAnimationTiming = {
				fadeIn: fadeIn,
				keep: keep,
				fadeAway: fadeAway,
				duration: duration,
				// @ts-ignore
				wordTime: props.line.dynamicLyric[index].time,
				// @ts-ignore
				wordDuration: props.line.dynamicLyric[index].duration
			};

			const glowTarget = karaokeLineRef.current?.children[index];
			const glowAnimation = glowTarget?.animate([
				{ filter: 'drop-shadow(0 0 0px rgba(var(--rnp-accent-color-shade-2-rgb), 0)) drop-shadow(0 0 0px rgba(var(--rnp-accent-color-shade-2-rgb), 0))' },
				{ filter: 'drop-shadow(0 0 15px rgba(var(--rnp-accent-color-shade-2-rgb), 1)) drop-shadow(0 0 10px rgba(var(--rnp-accent-color-shade-2-rgb), 0.5))', offset: fadeIn / duration },
				{ filter: 'drop-shadow(0 0 15px rgba(var(--rnp-accent-color-shade-2-rgb), 1)) drop-shadow(0 0 10px rgba(var(--rnp-accent-color-shade-2-rgb), 0.5))', offset: (fadeIn + keep) / duration },
				{ filter: 'drop-shadow(0 0 0px rgba(var(--rnp-accent-color-shade-2-rgb), 0)) drop-shadow(0 0 0px rgba(var(--rnp-accent-color-shade-2-rgb), 0))', offset: 1 }
			], {
				duration: duration,
				fill: 'forwards',
				delay: 0
			});
			glowAnimation?.pause();
			if (glowAnimation) glowAnimation.currentTime = 0;
			return {
				animation: glowAnimation,
				timing: glowAnimationTiming
			}
		}

		glowAnimationsRef.current = [];
		for (let i = 0; i < trailingIndexes.length; i++) {
			const tmp = glowAnimation(trailingIndexes[i]);
			if (tmp) glowAnimationsRef.current.push(tmp);
		}

		return () => {
			for (let i = 0; i < glowAnimationsRef.current.length; i++) {
				glowAnimationsRef.current[i].animation?.cancel();
			}
			glowAnimationsRef.current = [];
		};
	}, [props.line, useKaraokeLyrics, props.outOfRangeKaraoke, karaokeAnimation, lyricGlow]);

	// update glow animation
	useEffect(() => {
		for (let glowAnimation of glowAnimationsRef.current) {
			//console.log(glowAnimation, glowAnimationsRef.current);
			const animation = glowAnimation.animation;
			const timing = glowAnimation.timing;
            if (!animation) continue;

			if (props.currentLine != props.id) {
				if (props.currentLine > props.id) {
					if (animation.playState == 'running') {
						continue;
					}
					animation.currentTime = timing.duration;
				} else {
					animation.currentTime = 0;
					animation.pause();
				}
				continue;
			}
			if (playState == false) {
				animation.pause();
				//console.log(animation.currentTime);
				animation.currentTime = props.currentTime - timing.wordTime;
				//console.log(props.currentTime, timing.wordTime, props.currentTime - timing.wordTime);
				continue;
			}
			animation.play();
			animation.currentTime = props.currentTime - timing.wordTime;
			//console.log(props.currentTime, timing.wordTime, props.currentTime - timing.wordTime);
		}

	}, [props.currentLine, useKaraokeLyrics, seekCounter, karaokeAnimation, playState, lyricGlow]);


	return (
		<div
			ref={props.lineRef}
			// @ts-ignore
			className={`rnp-lyrics-line ${offset < 0 ? 'passed' : ''} ${props.line.isInterlude ? 'rnp-interlude' : ''}`}
			// @ts-ignore
			offset={offset}
			onClick={() => jumpToTime(props.line.time + 50)}
			onContextMenu={(e) => {
				e.preventDefault();
				// @ts-ignore
				if (props.line.isInterlude || !props.line.originalLyric) return;
				let all = props.line.originalLyric;
				if (showRomaji && props.line.romanLyric) all += '\n' + props.line.romanLyric;
				if (showTranslation && props.line.translatedLyric) all += '\n' + props.line.translatedLyric;
				const items: any[] = [
					{
						label: '复制该句歌词',
						callback: () => {
							copyTextToClipboard(all);
						}
					},
				];
				if (props.line.romanLyric || props.line.translatedLyric) {
					items.push({
						divider: true
					});
					items.push({
						label: '复制原文',
						callback: () => {
							copyTextToClipboard(props.line.originalLyric);
						}
					});
					if (props.line.romanLyric) {
						items.push({
							label: '复制罗马音',
							callback: () => {
								// @ts-ignore
								copyTextToClipboard(props.line.romanLyric);
							}
						});
					}
					if (props.line.translatedLyric) {
						items.push({
							label: '复制翻译',
							callback: () => {
								// @ts-ignore
								copyTextToClipboard(props.line.translatedLyric);
							}
						});
					}
				}
				showContextMenu(e.clientX, e.clientY, items);
			}}
			style={{
				display: (props.outOfRangeScrolling) ? 'none' : 'block',
				transform: `
					${props.transforms.left ? `translateX(${props.transforms.left}px)` : ''}
					translateY(${props.transforms.top + (props.transforms?.extraTop ?? 0)}px)
					scale(${props.transforms.scale})
					${props.transforms.rotate ? `rotate(${props.transforms.rotate}deg)` : ''}
				`,
				transitionDelay: `${props.transforms.delay}ms`,
				transitionDuration: `${props.transforms?.duration ?? 500}ms`,
				filter: props.transforms?.blur ? `blur(${props.transforms?.blur}px)` : 'none',
				opacity: props.transforms?.opacity ?? 1,
				...props.transforms?.outOfRangeHidden && { visibility: 'hidden' },
				willChange: 'transform, opacity, filter'
			}}>
			{props.line.dynamicLyric && useKaraokeLyrics && !props.outOfRangeKaraoke && <div className="rnp-lyrics-line-karaoke" ref={karaokeLineRef}>
				{props.line.dynamicLyric.map((word, index) => {
					return <div
						key={`${karaokeAnimation} ${index}`}
						// @ts-ignore
						ref={karaokeLineRef.current?.children[index]}
						className={`rnp-karaoke-word ${word?.isCJK ? 'is-cjk' : ''} ${word?.endsWithSpace ? 'end-with-space' : ''}`}
						style={getKaraokeAnimation(word)}>
						<span>{word.word}</span>
						{
							karaokeAnimation == 'slide' && <span className="rnp-karaoke-word-filler" style={getKaraokeAnimation(word)}>{word.word}</span>
						}
					</div>
				})}
			</div>}
			{!(props.line.dynamicLyric && useKaraokeLyrics && !props.outOfRangeKaraoke) && props.line.originalLyric && <div className="rnp-lyrics-line-original">
				{props.line.originalLyric}
			</div>}
			{props.line.romanLyric && showRomaji && <div className="rnp-lyrics-line-romaji">
				{props.line.romanLyric}
			</div>}
			{props.line.translatedLyric && showTranslation && <div className="rnp-lyrics-line-translated">
				{props.line.translatedLyric}
			</div>}
			{/* @ts-ignore */}
			{props.line.isInterlude && <Interlude
				id={props.id}
				line={props.line}
				currentLine={props.currentLine}
				currentTime={props.currentTime}
			/>}
		</div>
	)

}, (prev, next) => {
    // Always re-render if structural props change
    if (prev.id !== next.id) return false;
    if (prev.line !== next.line) return false;
    if (prev.currentLine !== next.currentLine) return false;
    
    // Only check currentTime if active or interlude
    const isActive = next.currentLine === next.id;
    // @ts-ignore
    const isInterlude = next.line.isInterlude;
    if ((isActive || isInterlude) && prev.currentTime !== next.currentTime) return false;

    if (prev.outOfRangeScrolling !== next.outOfRangeScrolling) return false;
    // if (prev.outOfRangeKaraoke !== next.outOfRangeKaraoke) return false; // This is derived in LineContent now? No, it's passed as prop?
    // Wait, outOfRangeKaraoke was passed as prop in my previous Lyrics.tsx
    // But I removed it from LineProps in types.ts?
    // Let me check types.ts again.
    
    // Deep compare transforms (performance critical)
    const t1 = prev.transforms;
    const t2 = next.transforms;
    if (
        t1.top !== t2.top ||
        t1.scale !== t2.scale ||
        t1.blur !== t2.blur ||
        t1.opacity !== t2.opacity ||
        t1.delay !== t2.delay ||
        t1.left !== t2.left ||
        t1.rotate !== t2.rotate ||
        t1.extraTop !== t2.extraTop ||
        t1.outOfRangeHidden !== t2.outOfRangeHidden
    ) return false;

    return true;
});

export function Line(props: LineProps) {
    const { reportHeight } = useLyricsContext();
	const lineRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!lineRef.current) return;
		const observer = new ResizeObserver(entries => {
			for (let entry of entries) {
				if (entry.contentRect.height > 0) {
					reportHeight(props.id, entry.contentRect.height);
				}
			}
		});
		observer.observe(lineRef.current);
		return () => observer.disconnect();
	}, [reportHeight, props.id]);

	if (props.outOfRangeScrolling) {
		const offset = props.id - props.currentLine;
		return (
			<div
				// @ts-ignore
				className={`rnp-lyrics-line ${props.line.isInterlude ? 'rnp-interlude' : ''}`}
				data-offset={offset}
				style={{ display: 'none' }}
			/>
		)
	}
    
    // Calculate outOfRangeKaraoke here or pass it?
    // Previously it was passed. Now I removed it from LineProps?
    // I should check if I removed it from LineProps in types.ts.
    // In types.ts I kept outOfRangeScrolling but commented out outOfRangeKaraoke.
    // So I need to calculate it here.
    const outOfRangeKaraoke = Math.abs(props.id - props.currentLine) > 10;

	return <LineContent {...props} outOfRangeKaraoke={outOfRangeKaraoke} lineRef={lineRef} />;
}
