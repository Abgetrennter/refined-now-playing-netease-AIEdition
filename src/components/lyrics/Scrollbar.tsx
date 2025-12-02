import React, { useEffect, useRef } from 'react';
import { ScrollbarProps } from './types';

export function Scrollbar(props: ScrollbarProps) {
	if (!props.nonInterludeToAll || !props.allToNonInterlude) {
		return null;
	}
	const scrollbarRef = useRef<HTMLDivElement>(null);
	const thumbRef = useRef<HTMLDivElement>(null);

	const currentLine = props.scrollingMode ? props.scrollingFocusLine : props.currentLine;
	const totalSteps = props.nonInterludeToAll.length;
	const thumbHeight = Math.max(props.containerHeight / totalSteps, 30);
	const heightOfTrack = props.containerHeight - thumbHeight;
	const perStep = totalSteps > 1 ? heightOfTrack / (totalSteps - 1) : 0;
	const current = props.allToNonInterlude[currentLine];

	useEffect(() => {
		const thumb = thumbRef.current;
		if (!thumb || !scrollbarRef.current) return;
		// const heightOfTrack = props.containerHeight - thumbHeight;
		// const perStep = heightOfTrack / (totalSteps - 1);
		let dragging = false;
		let startX: number, startY: number, offsetX: number, offsetY: number, trackTopY: number;
		const onMouseDown = (e: MouseEvent) => {
			dragging = true;
			thumb.classList.add('dragging');
			thumb.style.transitionDuration = '0.2s';
			// @ts-ignore
			thumb.style.transltionTimingFunction = 'ease-out';
			startX = e.clientX;
			startY = e.clientY;
			offsetX = e.offsetX;
			offsetY = e.offsetY;
			trackTopY = scrollbarRef.current!.getBoundingClientRect().top;
			document.addEventListener('mousemove', onMouseMove);
			document.addEventListener('mouseup', onMouseUp);
		}
		let lastFocusLine = props.currentLine; 
		const onMouseMove = (e: MouseEvent) => {
			if (!dragging) return;
			const diffX = e.clientX - startX;
			let y = e.clientY - trackTopY - offsetY;
			if (Math.abs(diffX) > 300) {
				y = startY - trackTopY - offsetY;
			}
			const cloest = Math.max(Math.min(Math.round(y / perStep), totalSteps - 1), 0);
			//console.log(cloest);
			const yOfCloest = cloest * perStep;
			//const distance = y - cloest * perStep;
			thumb.style.top = `${yOfCloest}px`;
			//thumb.style.transform = `translateY(${distance * 0.3}px)`;
			if (lastFocusLine == cloest) return;
			lastFocusLine = cloest;
			//console.log(props.nonInterludeToAll[cloest]);
			props.scrollingFocusOnLine(props.nonInterludeToAll[cloest]);
		}
		const onMouseUp = (e: MouseEvent) => {
			dragging = false;
			thumb.classList.remove('dragging');
			thumb.style.transitionDuration = '';
			//thumb.style.transform = `none`;
			// @ts-ignore
			thumb.style.transltionTimingFunction = '';
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
			props.exitScrollingModeSoon();
		}
		// @ts-ignore
		thumb.addEventListener('mousedown', onMouseDown);
		return () => {
			dragging = false;
			thumb.classList.remove('dragging');
			thumb.style.transitionDuration = '';
			// @ts-ignore
			thumb.style.transltionTimingFunction = '';
			// @ts-ignore
			thumb.removeEventListener('mousedown', onMouseDown);
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
			props.exitScrollingModeSoon();
		}
	}, [props.nonInterludeToAll, props.allToNonInterlude, props.containerHeight]);

	return (
		<div
			className={`rnp-lyrics-scrollbar ${props.overviewMode ? 'overview-mode-hide' : ''}`}
			ref={scrollbarRef}>
			<div
				className={`rnp-lyrics-scrollbar-thumb ${totalSteps > 1 ? '' : 'no-scroll'}`}
				ref={thumbRef}
				style={{
					height: thumbHeight,
					top: `${current * perStep}px`
				}} />
		</div>
	)
}
