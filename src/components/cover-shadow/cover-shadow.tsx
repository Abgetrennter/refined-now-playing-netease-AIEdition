import { getSetting } from '../../modules/settings/storage';
import React, { useState, useEffect } from 'react';

const getCoverType = () => {
	const type = getSetting('cover-blurry-shadow', 'true');
	if (type == 'true') {
		return 'colorful';
	} else {
		return 'black';
	}
};

interface CoverShadowProps {
	image: HTMLImageElement;
}

export function CoverShadow(props: CoverShadowProps) {
	const [type, setType] = useState(getCoverType()); // black and colorful
	const [rectangleCover, setRectangleCover] = useState<boolean>(getSetting('rectangle-cover', true));
	const [url, setUrl] = useState('');

	const image = props.image;

	useEffect(() => {
		const observer = new MutationObserver(() => {
			if (image.src === url) return;
			if (image.complete) {
				setUrl(image.src);
			}
		});
		observer.observe(image, { attributes: true, attributeFilter: ['src'] });
		const onload = () => {
			setUrl(image.src);
		};
		image.addEventListener('load', onload);
		return () => {
			observer.disconnect();
			image.removeEventListener('load', onload);
		}
	}, [image]);

	useEffect(() => {
		const observer = new MutationObserver(() => {
			setRectangleCover(document.body.classList.contains('rectangle-cover'));
		});
		observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
		setRectangleCover(document.body.classList.contains('rectangle-cover'));
		return () => {
			observer.disconnect();
		}
	}, []);

	useEffect(() => {
		const listener = (e: any) => {
			setType(e.detail.type ?? 'colorful');
		};
		document.addEventListener('rnp-cover-shadow-type', listener);
		return () => {
			document.removeEventListener('rnp-cover-shadow-type', listener);
		}
	}, []);

	if (!url) return null;

	if (type === 'black') {
		return null;
	}

	return (
		<style>
			{`
				.n-single .cdwrap::before {
					content: '';
					display: block;
					background-image: url(${url});
					background-size: cover;
					background-position: center;
					background-repeat: no-repeat;
					position: absolute;
					left: 0;
					right: 0;
					top: 0;
					bottom: 0;
					filter: saturate(1.3) brightness(1.2) blur(25px);
					opacity: .6;
					${rectangleCover ?
					`
							border-radius: 16px;
							transform: translateY(4%);
						`
					:
					`
							border-radius: 50%;
						`
				}
				}
				.n-single .cdwrap .cdimg{
					box-shadow: none !important;
				}
			`}
		</style>
	);
}
