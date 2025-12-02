import React, { useState, useEffect, useRef } from 'react';
import './mini-song-info.scss';

interface MiniSongInfoProps {
    image: HTMLImageElement;
    infContainer: HTMLElement;
}

export function MiniSongInfo(props: MiniSongInfoProps) {
	const [title, setTitle] = useState('');
	const [artist, setArtist] = useState('');
	const [album, setAlbum] = useState('');

	const image = props.image;

	useEffect(() => {
		const observer = new MutationObserver(() => {
			if (image.src === album) return;
			if (image.complete) {
				setAlbum(image.src);
			}
		});
		observer.observe(image, { attributes: true, attributeFilter: ['src'] });
		const onload = () => {
			setAlbum(image.src);
		};
		image.addEventListener('load', onload);
        
        // Initial check
        if (image.complete && image.src !== album) {
            setAlbum(image.src);
        }

		return () => {
			observer.disconnect();
			image.removeEventListener('load', onload);
		}
	}, [image, album]);

	const infContainer = props.infContainer;
	useEffect(() => {
		const onObverse = () => {
            const titleEl = infContainer.querySelector('.title .name');
            const artistEls = infContainer.querySelectorAll('.info .playfrom > li:first-child a');
            
			const title = titleEl ? titleEl.textContent?.trim() ?? '' : '';
			const artist = Array.from(artistEls).map(a => a.textContent?.trim() ?? '').join(' / ');
			setTitle(title);
			setArtist(artist);
		};
		onObverse();
		const observer = new MutationObserver(() => {
			onObverse();
		});
		observer.observe(infContainer, { childList: true, subtree: true });
		return () => {
			observer.disconnect();
		}
	} , [infContainer]);

	return (
		<>
			<div className="album">
				<img src={album} alt="" />
			</div>
			<div className="info">
				<div className="title">{title}</div>
				<div className="artist">{artist}</div>
			</div>
		</>
	);
}
