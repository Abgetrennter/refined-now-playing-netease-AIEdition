import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { getSetting, setSetting } from '../../modules/settings/storage';
import { showContextMenu } from '../context-menu/context-menu';
import './lyrics.scss';
import './lyric-provider';

import { LyricsProps } from './types';
import { Line } from './Line';
import { Contributors } from './Contributors';
import { Scrollbar } from './Scrollbar';
import { LyricOverview } from './LyricOverview';
import { useLyrics } from './hooks/useLyrics';
import { useStyles } from './hooks/useStyles';
import { useScrolling } from './hooks/useScrolling';
import { usePlayback } from './hooks/usePlayback';
import { useTransforms } from './hooks/useTransforms';

export function Lyrics(props: LyricsProps) {
	const isFM = props.isFM ?? false;
	const containerRef = useRef<HTMLDivElement>(null);
	const overviewContainerRef = useRef<HTMLDivElement>(null);

	// Custom Hooks
	const {
		lyrics,
		_lyrics,
		isUnsynced,
		lyricContributors,
		allToNonInterludeLyricsMapping,
		nonInterludeToAllLyricsMapping,
		shouldTransit,
		recalcCounter
	} = useLyrics(isFM);

	const styleProps = useStyles();
	const {
		fontSize,
		showTranslation,
		showRomaji,
		useKaraokeLyrics,
		karaokeAnimation,
		lyricGlow,
		setShowTranslation,
		setShowRomaji,
		setUseKaraokeLyrics,
		lyricStagger
	} = styleProps;

	const [currentLine, setCurrentLine] = useState(0);
	const _currentLine = useRef(0);
    const _playState = useRef(true);
	const _setCurrentLine = setCurrentLine;
	// @ts-ignore
	const setCurrentLineWrapper = (x) => {
		_currentLine.current = x as number;
		_setCurrentLine(x);
	}

	const [currentLineForScrolling, setCurrentLineForScrolling] = useState(0);

	const {
		scrollingMode,
		setScrollingMode,
		scrollingFocusLine,
		setScrollingFocusLine,
		_scrollingMode,
		_scrollingFocusLine,
		exitScrollingModeSoon,
		scrollingFocusOnLine
	} = useScrolling(containerRef, _lyrics, shouldTransit, _currentLine, _playState, currentLine);

	const {
		playState,
		currentTime,
		seekCounter,
		jumpToTime
	} = usePlayback(
		isFM, 
		_lyrics, 
		shouldTransit, 
		lyricStagger, 
		setScrollingMode, 
		_scrollingMode, 
		setScrollingFocusLine, 
		_scrollingFocusLine, 
		setCurrentLineWrapper, 
		setCurrentLineForScrolling,
		_currentLine,
        _playState
	);

	const {
		lineTransforms,
		reportHeight,
		containerHeight
	} = useTransforms(
		containerRef,
		lyrics,
		currentLine,
		currentLineForScrolling,
		scrollingMode,
		scrollingFocusLine,
		shouldTransit,
		styleProps,
		recalcCounter
	);

	const [overviewMode, setOverviewMode] = useState(false);
	const [overviewModeScrolling, setOverviewModeScrolling] = useState(false);
	const exitOverviewModeScrollingTimeout = useRef<any>(null);

	useLayoutEffect(() => {
		if (!overviewMode) return;
		if (overviewModeScrolling) return;
		if (!overviewContainerRef.current) return;
		const container = overviewContainerRef.current;
		const current = container.querySelector('.rnp-lyrics-overview-line.current') as HTMLElement;
		if (!current) return;
		const scrollTop = current.offsetTop - container.clientHeight / 2 + current.clientHeight / 2;
		container.scrollTop = scrollTop;
	}, [overviewMode, showRomaji, showTranslation]);

	useEffect(() => {
		if (!overviewMode) return;
		if (overviewModeScrolling) return;
		if (!overviewContainerRef.current) return;
		const container = overviewContainerRef.current;
		const current = container.querySelector('.rnp-lyrics-overview-line.current') as HTMLElement;
		if (!current) return;
		const scrollTop = current.offsetTop - container.clientHeight / 2 + current.clientHeight / 2;
		container.scrollTo({ top: scrollTop, behavior: 'smooth' });
	}, [currentLine, overviewModeScrolling]);

	const exitOverviewModeScrollingSoon = useCallback((timeout = 3000) => {
		if (exitOverviewModeScrollingTimeout.current) {
			clearTimeout(exitOverviewModeScrollingTimeout.current);
			exitOverviewModeScrollingTimeout.current = null;
		}
		exitOverviewModeScrollingTimeout.current = setTimeout(() => {
			setOverviewModeScrolling(false);
		}, timeout);
	}, []);

	const overviewModeSelectAll = useCallback(() => {
		const container = overviewContainerRef.current;
		const selection = window.getSelection();
		const range = document.createRange();
		if (!container || !selection) return;
		range.selectNodeContents(container);
		selection.removeAllRanges();
		selection.addRange(range);
	}, [overviewContainerRef]);

	const isPureMusic = lyrics && (
		lyrics.length === 1 ||
		lyrics.length <= 10 && lyrics.some((x) => (x.originalLyric ?? '').includes('纯音乐'))
	);

	const length = lyrics?.length ?? 0;

	return (
		<>
			<div
				className={`rnp-lyrics ${isPureMusic ? 'pure-music' : ''} ${(overviewMode || isUnsynced) ? 'overview-mode-hide' : ''}`}
				ref={containerRef}
				style={{
					fontSize: `${fontSize}px`,
				}}>
				{lyrics && lyrics.map((line, index) => {
					return <Line
						key={`${index}`} // Removed songId to avoid prop drilling, index should be stable enough for now or add id to line
						id={index}
						line={line}
						currentLine={currentLine}
						currentTime={currentTime.current + 0 /* globalOffset handled in hook? No, passed in Line props */}
						seekCounter={seekCounter}
						playState={playState}
						showTranslation={showTranslation}
						showRomaji={showRomaji}
						useKaraokeLyrics={useKaraokeLyrics}
						jumpToTime={isPureMusic ? () => { } : jumpToTime}
						transforms={lineTransforms[index] ?? { top: 0, scale: 1, delay: 0, blur: 0 }}
						karaokeAnimation={karaokeAnimation}
						outOfRangeScrolling={scrollingMode && length > 100 && Math.abs(index - scrollingFocusLine) > 20}
						outOfRangeKaraoke={/*length > 100 && */Math.abs(index - currentLine) > 10}
						lyricGlow={lyricGlow}
						reportHeight={reportHeight}
					/>
				})}
				<Contributors
					transforms={lineTransforms[length] ?? { top: 0, scale: 1, delay: 0, blur: 0 }}
					contributors={lyricContributors}
				/>
			</div>
			<Scrollbar
				nonInterludeToAll={nonInterludeToAllLyricsMapping}
				allToNonInterlude={allToNonInterludeLyricsMapping}
				currentLine={currentLine}
				containerHeight={containerHeight}
				scrollingMode={scrollingMode}
				scrollingFocusLine={scrollingFocusLine}
				scrollingFocusOnLine={scrollingFocusOnLine}
				exitScrollingModeSoon={exitScrollingModeSoon}
				overviewMode={overviewMode || isUnsynced}
			/>
			<div className="rnp-lyrics-switch">
				<button
					className={`
						rnp-lyrics-switch-btn
						rnp-lyrics-switch-btn-top
						rnp-lyrics-switch-btn-placeholder
					`}
					style={{ visibility: 'hidden' }}
				>
				</button>
				{
					!isUnsynced && <button
						className={`
							rnp-lyrics-switch-btn
							rnp-lyrics-switch-btn-top
							rnp-lyrics-switch-btn-overview-mode
							${overviewMode ? 'active' : ''}
						`}
						title="复制模式"
						onClick={() => {
							setOverviewMode(!overviewMode);
						}}>
						<svg style={{ transform: 'translate(-2px, -2px)' }} xmlns="http://www.w3.org/2000/svg" height="20" width="20"><path d="M4.146 14.854v-1.396h6.792v1.396Zm0-2.937v-1.396h11.729v1.396Zm0-2.959V7.562h11.729v1.396Zm0-2.937V4.625h11.729v1.396Z" /></svg>
					</button>
				}
				{
					(overviewMode || isUnsynced) &&
					<button
						className={`
							rnp-lyrics-switch-btn
							rnp-lyrics-switch-btn-top
							rnp-lyrics-switch-btn-select-all
						`}
						title="全选"
						onClick={() => {
							overviewModeSelectAll();
						}}>
						<svg style={{ transform: 'translate(-1px, 0px)' }} xmlns="http://www.w3.org/2000/svg" height="20" width="20"><path d="M4.583 16.833q-.583 0-.989-.406t-.406-.989h1.395Zm-1.395-3v-1.479h1.395v1.479Zm0-3.083V9.271h1.395v1.479Zm0-3.083V6.188h1.395v1.479Zm0-3.084q0-.583.406-.989t.989-.406v1.395Zm2.874 9.375V6.062h7.896v7.896Zm.126 2.875v-1.395h1.479v1.395Zm0-12.25V3.188h1.479v1.395Zm1.27 7.979h5.104V7.458H7.458Zm1.813 4.271v-1.395h1.479v1.395Zm0-12.25V3.188h1.479v1.395Zm3.083 12.25v-1.395h1.479v1.395Zm0-12.25V3.188h1.479v1.395Zm3.084 12.25v-1.395h1.395q0 .583-.406.989t-.989.406Zm0-3v-1.479h1.395v1.479Zm0-3.083V9.271h1.395v1.479Zm0-3.083V6.188h1.395v1.479Zm0-3.084V3.188q.583 0 .989.406t.406.989Z" transform="scale(0.8)" /></svg>
					</button>
				}
				<div className="rnp-lyrics-switch-btn-divider" />
				<button
					className={`
						rnp-lyrics-switch-btn
						generate-gpt-translation-btn
					`}
					style={{ display: 'none', marginBottom: '10px' }}
					title="使用 ChatGPT 生成翻译"
					onClick={async () => {
						// @ts-ignore
						if (window.generateGPTTranslation) {
							// @ts-ignore
							await window.generateGPTTranslation();
						}
					}}>
					<svg viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" /></svg>
				</button>
				<button
					className={`
						rnp-lyrics-switch-btn
						${showTranslation ? 'active' : ''}
						${lyrics && lyrics.some((x: any) => x.translatedLyric) ? '' : 'unavailable'}
					`}
					title="翻译"
					onClick={() => {
						setSetting("show-translation", !showTranslation);
						setShowTranslation(!showTranslation);
					}}>译</button>
				<button
					className={`
						rnp-lyrics-switch-btn
						${showRomaji ? 'active' : ''}
						${lyrics && lyrics.some((x: any) => x.romanLyric) ? '' : 'unavailable'}
					`}
					title="罗马音"
					onClick={() => {
						setSetting("show-romaji", !showRomaji);
						setShowRomaji(!showRomaji);
					}}>音</button>
				<button
					className={
						`rnp-lyrics-switch-btn
						${useKaraokeLyrics ? 'active' : ''}
						${lyrics && lyrics.some((x: any) => x.dynamicLyric) ? '' : 'unavailable'}
					`}
					title="逐字歌词"
					onClick={() => {
						setSetting("use-karaoke-lyrics", !useKaraokeLyrics);
						setUseKaraokeLyrics(!useKaraokeLyrics);
					}}>逐字</button>
			</div>
			{
				(overviewMode || isUnsynced) &&
				<LyricOverview
					lyrics={lyrics}
					currentLine={currentLine}
					showRomaji={showRomaji}
					showTranslation={showTranslation}
					jumpToTime={jumpToTime}
					isUnsynced={isUnsynced}
					overviewContainerRef={overviewContainerRef}
					setOverviewModeScrolling={setOverviewModeScrolling}
					exitOverviewModeScrollingSoon={exitOverviewModeScrollingSoon}
				/>
			}
		</>
	);
}
