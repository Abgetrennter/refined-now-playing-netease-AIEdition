// Trigger lyrics-updated event when lyrics are updated
// Also provide a global variable `currentLyrics` for other scripts to use

import { parseLyric, LyricLine } from '../../liblyric/index'
import { cyrb53 } from '../../utils/utils'

declare const betterncm: any;
declare global {
	interface Window {
		onProcessLyrics: (rawLyrics: any, songID: any) => any;
		currentLyrics: any;
	}
}

const preProcessLyrics = (lyrics: any): LyricLine[] | null => {
	if (!lyrics) return null;
	if (!lyrics.lrc) lyrics.lrc = {};

	const original = (lyrics?.lrc?.lyric ?? '').replace(/\u3000/g, ' ');
	const translation = lyrics?.ytlrc?.lyric ?? lyrics?.ttlrc?.lyric ?? lyrics?.tlyric?.lyric ?? '';
	const roma = lyrics?.yromalrc?.lyric ?? lyrics?.romalrc?.lyric ?? '';
	const dynamic = lyrics?.yrc?.lyric ?? '';
	const approxLines = original.match(/\[(.*?)\]/g)?.length ?? 0;

	const parsed = parseLyric(
		original,
		translation,
		roma,
		dynamic
	);
	if (approxLines - parsed.length > approxLines * 0.7) { // 某些特殊情况（逐字歌词残缺不全）
		return parseLyric(
			original,
			translation,
			roma
		);
	}
	return parsed;
}


const processLyrics = (lyrics: LyricLine[] | null) => {
	if (!lyrics) return [];
	for (const line of lyrics) {
		if (line.originalLyric == '') {
			// @ts-ignore
			line.isInterlude = true;
		}
	}
	return lyrics;
}

let currentRawLRC: string | null = null;

const _onProcessLyrics = window.onProcessLyrics ?? ((x: any) => x);
window.onProcessLyrics = (_rawLyrics: any, songID: any) => {
	if (!_rawLyrics || _rawLyrics?.data === -400) return _onProcessLyrics(_rawLyrics, songID);

	let rawLyrics = _rawLyrics;
	if (typeof (_rawLyrics) === 'string') { // local lyrics
		rawLyrics = {
			lrc: {
				lyric: _rawLyrics,
			},
			source: {
				name: '本地',
			}
		}
	}

	if ((rawLyrics?.lrc?.lyric ?? '') != currentRawLRC) {
		console.log('Update Raw Lyrics', rawLyrics);
		currentRawLRC = (rawLyrics?.lrc?.lyric ?? '');
		const preprocessedLyrics = preProcessLyrics(rawLyrics);
		setTimeout(async () => {
			const processedLyrics = await processLyrics(preprocessedLyrics);
			const lyrics: any = {
				lyrics: processedLyrics,
				contributors: {}
			}

			// @ts-ignore
			if (processedLyrics[0]?.unsynced) {
				lyrics.unsynced = true;
			}

			if (rawLyrics?.lyricUser) {
				lyrics.contributors.original = {
					name: rawLyrics.lyricUser.nickname,
					userid: rawLyrics.lyricUser.userid,
				}
			}
			if (rawLyrics?.transUser) {
				lyrics.contributors.translation = {
					name: rawLyrics.transUser.nickname,
					userid: rawLyrics.transUser.userid,
				}
			}
			lyrics.contributors.roles = rawLyrics?.roles ?? [];
			lyrics.contributors.roles = lyrics.contributors.roles.filter((role: any) => {
				if (role.artistMetaList.length == 1 && role.artistMetaList[0].artistName == '无' && role.artistMetaList[0].artistId == 0) {
					return false;
				}
				return true;
			});
			for (let i = 0; i < lyrics.contributors.roles.length; i++) {
				const metaList = JSON.stringify(lyrics.contributors.roles[i].artistMetaList);
				for (let j = i + 1; j < lyrics.contributors.roles.length; j++) {
					if (JSON.stringify(lyrics.contributors.roles[j].artistMetaList) === metaList) {
						lyrics.contributors.roles[i].roleName += `、${lyrics.contributors.roles[j].roleName}`;
						lyrics.contributors.roles.splice(j, 1);
						j--;
					}
				}
			}


			if (rawLyrics?.source) {
				lyrics.contributors.lyricSource = rawLyrics.source;
			}
			lyrics.hash = `${betterncm.ncm.getPlaying().id}-${cyrb53(processedLyrics.map((x) => x.originalLyric).join('\\'))}`;
			window.currentLyrics = lyrics;
			console.group('Update Processed Lyrics');
			console.log('lyrics', window.currentLyrics.lyrics);
			console.log('contributors', window.currentLyrics.contributors);
			console.log('hash', window.currentLyrics.hash);
			console.groupEnd();
			document.dispatchEvent(new CustomEvent('lyrics-updated', { detail: window.currentLyrics }));
		}, 0);
	}
	return _onProcessLyrics(_rawLyrics, songID);
}
