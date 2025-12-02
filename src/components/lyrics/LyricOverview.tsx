import React, { useEffect } from 'react';
import { LyricOverviewProps } from './types';

export function LyricOverview(props: LyricOverviewProps) {
	useEffect(() => {
		const container = props.overviewContainerRef.current;
		if (!container) return;
		let selecting = false;
		const onWheel = () => {
			props.setOverviewModeScrolling(true);
			if (!selecting) props.exitOverviewModeScrollingSoon();
		};
		const onMouseDown = (e: MouseEvent) => {
			if (e.button != 0) return;
			const line = (e.target as HTMLElement).closest('.rnp-lyrics-overview-line');
			if (!line) return;
			selecting = true;
			props.setOverviewModeScrolling(true);
			document.addEventListener('mousemove', onMouseMove);
			document.addEventListener('mouseup', onMouseUp);
		};
		const onMouseMove = (e: MouseEvent) => {
			if (!selecting) return;
			props.setOverviewModeScrolling(true);
		};
		const onMouseUp = (e: MouseEvent) => {
			if (!selecting) return;
			selecting = false;
			props.setOverviewModeScrolling(true);
			props.exitOverviewModeScrollingSoon();
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		};
		container.addEventListener('wheel', onWheel);
		container.addEventListener('mousedown', onMouseDown);
		return () => {
			container.removeEventListener('wheel', onWheel);
			container.removeEventListener('mousedown', onMouseDown);
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		};
	}, []);

	return (
		<div className="rnp-lyrics rnp-lyrics-overview-container" ref={props.overviewContainerRef}>
			<div className="rnp-lyrics-overview">
				{
					props.isUnsynced && <div className="rnp-lyrics-overview-line unsynced-indicator">
						歌词暂不支持滚动
					</div>
				}
				{props.lyrics && props.lyrics.map((line, index) => {
					// @ts-ignore
					return !(props.isUnsynced && index == 0) && <div
						key={index}
						className={`
							rnp-lyrics-overview-line
							${index == props.currentLine ? 'current' : ''}
							${index < props.currentLine ? 'passed' : ''}
							${
							// @ts-ignore
							line.isInterlude ? 'interlude' : ''}
						`}
						onContextMenu={(e) => {
							e.preventDefault();
							if (props.isUnsynced) return;
							props.jumpToTime(line.time + 50);
							props.exitOverviewModeScrollingSoon(0);
						}}>
						{/* @ts-ignore */}
						{!line.isInterlude && <div className="rnp-lyrics-overview-line-original">{line.originalLyric}</div>}
						{line.romanLyric && props.showRomaji && <div className="rnp-lyrics-overview-line-romaji">{line.romanLyric}</div>}
						{line.translatedLyric && props.showTranslation && <div className="rnp-lyrics-overview-line-translation">{line.translatedLyric}</div>}
					</div>
				})}
			</div>
		</div>
	);
}
