import { LyricLine } from '../../liblyric';

export interface LyricsProps {
	isFM?: boolean;
}

export interface LineTransform {
	top: number;
	scale: number;
	delay: number;
	blur?: number;
	opacity?: number;
	left?: number;
	extraTop?: number;
	rotate?: number;
	outOfRangeHidden?: boolean;
	duration?: number;
}

export interface LineProps {
	id: number;
	line: LyricLine;
	currentLine: number;
	currentTime: number;
	seekCounter: number;
	playState: boolean;
	showTranslation: boolean;
	showRomaji: boolean;
	useKaraokeLyrics: boolean;
	jumpToTime: (time: number) => void;
	transforms: LineTransform;
	karaokeAnimation: string;
	outOfRangeScrolling: boolean;
	outOfRangeKaraoke: boolean;
	lyricGlow: boolean;
	reportHeight: (index: number, height: number) => void;
}

export interface InterludeProps {
	id: number;
	line: LyricLine;
	currentLine: number;
	currentTime: number;
	seekCounter: number;
	playState: boolean;
}

export interface ContributorsProps {
	transforms: LineTransform;
	contributors: any;
}

export interface ScrollbarProps {
	nonInterludeToAll: number[];
	allToNonInterlude: number[];
	currentLine: number;
	containerHeight: number;
	scrollingMode: boolean;
	scrollingFocusLine: number;
	scrollingFocusOnLine: (line: number) => void;
	exitScrollingModeSoon: () => void;
	overviewMode: boolean;
}

export interface LyricOverviewProps {
	lyrics: LyricLine[] | null;
	currentLine: number;
	showRomaji: boolean;
	showTranslation: boolean;
	jumpToTime: (time: number) => void;
	isUnsynced: boolean;
	overviewContainerRef: React.RefObject<HTMLDivElement | null>;
	setOverviewModeScrolling: (scrolling: boolean) => void;
	exitOverviewModeScrollingSoon: (timeout?: number) => void;
}
