import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { LineTransform } from '../types';
import { LyricLine } from '../../../liblyric';

export function useTransforms(
    containerRef: React.RefObject<HTMLDivElement | null>,
    lyrics: LyricLine[] | null,
    currentLine: number,
    currentLineForScrolling: number,
    scrollingMode: boolean,
    scrollingFocusLine: number,
    shouldTransit: React.RefObject<boolean>,
    styleProps: any,
    recalcCounter: number
) {
    // Use internal tick to force re-calculation when height changes
    const [heightUpdateTick, setHeightUpdateTick] = useState(0);
    const heightOfItems = useRef<{ [key: number]: number }>({});
    const previousFocusedLineRef = useRef(0);

    const [containerHeight, setContainerHeight] = useState(0);
	const [containerWidth, setContainerWidth] = useState(0);

    const reportHeight = useCallback((index: number, height: number) => {
		if (heightOfItems.current[index] !== height) {
			heightOfItems.current[index] = height;
            setHeightUpdateTick(t => t + 1);
		}
	}, []);

    const onResize = () => {
		shouldTransit.current = false;
		const container = containerRef.current;
		if (!container) return;
		setContainerHeight(container.clientHeight);
		setContainerWidth(container.clientWidth);
	};

    useEffect(() => {
		if (!containerRef.current) return;
		const resizeObserver = new ResizeObserver(() => {
			onResize();
		});
		resizeObserver.observe(containerRef.current);
		return () => {
			resizeObserver.disconnect();
		}
	}, []);


    const lineTransforms = useMemo(() => { // Recalculate vertical positions and transforms of each line
		if (lyrics == null || lyrics == undefined) return [];
		if (!containerRef.current) return [];

        const {
            fontSize, lyricFade, lyricZoom, lyricBlur, lyricRotate, RotateCurvature,
            showTranslation, showRomaji, useKaraokeLyrics,
            currentLyricAlignmentPercentage, lyricStagger,
            customScaleFunc, customBlurFunc, customOpacityFunc
        } = styleProps;

		const space = (fontSize as number) * 1.2;
		const delayByOffset = (offset: number) => {
			if (currentLineForScrolling == previousFocusedLineRef.current || scrollingMode) {
				return 0;
			}
			if (!lyricStagger) {
				return 0;
			}
			let sign = currentLineForScrolling - previousFocusedLineRef.current > 0 ? 1 : -1;
			offset = Math.max(-4, Math.min(4, offset)) * sign + 4;
			return offset * 50;
		};
		const scaleByOffset = (offset: number) => {
			if (!lyricZoom) return 1;
			if (customScaleFunc) {
				try {
					// @ts-ignore
					return Number(customScaleFunc(offset));
				} catch (e) {
					console.error('Error in custom scale function', e);
				}
			}
			offset = Math.abs(offset);
			offset = Math.max(1 - offset * 0.2, 0);
			return offset * offset * offset /* offset*/ * 0.3 + 0.7;
		};
		const blurByOffset = (offset: number) => {
			if (!lyricBlur || scrollingMode) return 0;
			if (customBlurFunc) {
				try {
					// @ts-ignore
					return Number(customBlurFunc(offset));
				} catch (e) {
					console.error('Error in custom blur function', e);
				}
			}
			offset = Math.abs(offset);
			if (offset == 0) return 0;
			return Math.min(0.5 + 1 * offset, 4.5);
		};
		const opacityByOffset = (offset: number) => {
			if (!lyricFade || scrollingMode) return 1;
			if (customOpacityFunc) {
				try {
					// @ts-ignore
					return Number(customOpacityFunc(offset));
				} catch (e) {
					console.error('Error in custom opacity function', e);
				}
			}
			offset = Math.abs(offset);
			if (offset <= 1) return 1;
			return Math.max(1 - 0.4 * (offset - 1), 0);
		};
		const setRotateTransform = (line: LineTransform, yOffset: number, height: number) => {
			if (!lyricRotate) return;
			const curvature = parseInt(String(RotateCurvature));
			const origin = [-120 + (curvature - 25), -(yOffset + height / 2)];
			const len = Math.sqrt(origin[0] * origin[0] + origin[1] * origin[1]);
			line.rotate = Math.min(yOffset / window.innerHeight * -curvature, 90);

			const deg = line.rotate + Math.atan2(origin[1], origin[0]) * 180 / Math.PI;
			line.extraTop = Math.sin(deg * Math.PI / 180) * len - origin[1];
			line.left = Math.cos(deg * Math.PI / 180) * len - origin[0];

			const opacity = 1 - (1 * Math.abs(yOffset * 2 / window.innerHeight) ** 1.15 * 1.2);
			line.opacity = Math.max(opacity, 0);
			if (opacity <= -1.5) line.outOfRangeHidden = true;
			else if (line.outOfRangeHidden) delete line.outOfRangeHidden;
		};


		const getHeight = (index: number) => {
			return heightOfItems.current[index] ?? ((fontSize as number) * 1.5 + 10);
		};

		const transforms: LineTransform[] = [];
		for (let i = 0; i <= lyrics.length; i++) transforms.push({ top: 0, scale: 1, delay: 0 });
		
		let current = Math.min(Math.max(currentLineForScrolling ?? 0, 0), lyrics.length - 1);
		if (current == -1) current = 0;
		if (scrollingMode) {
			current = Math.min(Math.max(scrollingFocusLine ?? 0, 0), lyrics.length - 1);
		}

		//transforms[current].top = containerHeight / 2 - getHeight(current) / 2;
		transforms[current].top =
			containerRef.current.clientHeight * (currentLyricAlignmentPercentage * 0.01) -
			getHeight(current) / 2;
		transforms[current].scale = 1;
		transforms[current].delay = delayByOffset(0);
		transforms[current].blur = blurByOffset(0);
		const currentLineHeight = getHeight(current);
		// @ts-ignore
		if (lyrics[current]?.isInterlude && !scrollingMode) {
			// temporary heighten the interlude line
			heightOfItems.current[current] = currentLineHeight + 50;
		}
		// all lines before current
		for (let i = current - 1; i >= 0; i--) {
			transforms[i].scale = scaleByOffset(current - i);
			transforms[i].blur = blurByOffset(i - current);
			transforms[i].opacity = opacityByOffset(i - current);
			
            const hCurrent = getHeight(i);
            const hNext = getHeight(i + 1);
            const sCurrent = transforms[i].scale;
            const sNext = transforms[i + 1].scale;

			// Correct formula for transform-origin: center (or left center)
            // VisualBottomI = VisualTopNext - space
            // topI + hI(1+sI)/2 = topNext + hNext(1-sNext)/2 - space
            transforms[i].top = transforms[i + 1].top + hNext * (1 - sNext) / 2 - space - hCurrent * (1 + sCurrent) / 2;

			transforms[i].delay = delayByOffset(i - current);
			setRotateTransform(transforms[i], transforms[current].top - transforms[i].top, hCurrent * sCurrent);
		}
		// all lines after current
		for (let i = current + 1; i < lyrics.length; i++) {
			transforms[i].scale = scaleByOffset(i - current);
			transforms[i].blur = blurByOffset(i - current);
			transforms[i].opacity = opacityByOffset(i - current);

            const hCurrent = getHeight(i);
            const hPrev = getHeight(i - 1);
            const sCurrent = transforms[i].scale;
            const sPrev = transforms[i - 1].scale;

            // Correct formula for transform-origin: center (or left center)
            // VisualTopI = VisualBottomPrev + space
            // topI + hI(1-sI)/2 = topPrev + hPrev(1+sPrev)/2 + space
			transforms[i].top = transforms[i - 1].top + hPrev * (1 + sPrev) / 2 + space - hCurrent * (1 - sCurrent) / 2;

			transforms[i].delay = delayByOffset(i - current);
			setRotateTransform(transforms[i], transforms[current].top - transforms[i].top, hCurrent * sCurrent);
		}
		// contributors line
		transforms[lyrics.length].scale = scaleByOffset(lyrics.length - 1 - current);
		transforms[lyrics.length].blur = blurByOffset(lyrics.length - 1 - current);
		transforms[lyrics.length].opacity = opacityByOffset(lyrics.length - 1 - current);
		if (lyrics.length > 0) {
            const hCurrent = getHeight(lyrics.length);
            const hPrev = getHeight(lyrics.length - 1);
            const sCurrent = transforms[lyrics.length].scale;
            const sPrev = transforms[lyrics.length - 1].scale;
            
			transforms[lyrics.length].top = transforms[lyrics.length - 1].top + hPrev * (1 + sPrev) / 2 + Math.min(space * 1.5, 90) - hCurrent * (1 - sCurrent) / 2;
		} else {
			transforms[lyrics.length].top = containerHeight / 2 - getHeight(lyrics.length) / 2;
			transforms[lyrics.length].blur = blurByOffset(0);
			transforms[lyrics.length].scale = scaleByOffset(0);
			transforms[lyrics.length].opacity = opacityByOffset(0);
		}
		transforms[lyrics.length].delay = delayByOffset(lyrics.length - current);
		setRotateTransform(transforms[lyrics.length], transforms[current].top - transforms[lyrics.length].top, getHeight(lyrics.length) * transforms[lyrics.length].scale);
		// set the height of interlude line back to normal
		heightOfItems.current[current] = currentLineHeight;
		// reset delay to 0 if necessary
		// for no transition when resizing, etc.
		if (!shouldTransit.current && !scrollingMode) {
			for (let i = 0; i <= lyrics.length; i++) {
				transforms[i].delay = 0;
				transforms[i].duration = 0;
			}
		}

        previousFocusedLineRef.current = currentLineForScrolling;
		return transforms;
	}, [
		currentLineForScrolling,
		containerHeight, containerWidth,
		styleProps,
		scrollingMode, scrollingFocusLine,
		recalcCounter,
		lyrics,
		heightUpdateTick
	]);

    return {
        lineTransforms,
        reportHeight,
        containerHeight
    };
}
