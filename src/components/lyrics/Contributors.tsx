import React from 'react';
import { ContributorsProps } from './types';

interface ArtistProps {
	role: any;
}

function Artist(props: ArtistProps) {
	if (!props.role) {
		return null;
	}
	return (
		<div className="rnp-contributor rnp-contributor-artist">
			<span>{props.role.roleName}: </span>
			{
				props.role.artistMetaList.map((artist: any, index: number) => {
					return (
						<React.Fragment key={index}>
							{
								artist.artistId ?
									<a className="rnp-contributor-artist" href={`#/m/artist/?id=${artist.artistId}`}>
										{artist.artistName}
									</a> :
									<span className="rnp-contributor-artist">
										{artist.artistName}
									</span>
							}
							{index < props.role.artistMetaList.length - 1 && <span>, </span>}
						</React.Fragment>
					);
				})
			}
		</div>
	);
}

interface ContributorProps {
	text: string;
	user: any;
}

function Contributor(props: ContributorProps) {
	if (!props.user) {
		return null;
	}
	return (
		<div className="rnp-contributor rnp-contributor-lyrics">
			<span>{props.text}: </span>
			{
				props?.user?.userid ?
					<a className="rnp-contributor-user" href={`#/m/personal/?uid=${props.user.userid}`}>
						{props.user.name}
					</a> :
					<span className="rnp-contributor-user">
						{props.user.name}
					</span>
			}
		</div>
	);
}

export function Contributors(props: ContributorsProps) {
	const contributors = props.contributors;
	return (
		<div
			className="rnp-contributors"
			style={{
				transform: `
					${props.transforms.left ? `translateX(${props.transforms.left}px)` : ''}
					translateY(${props.transforms.top + (props.transforms?.extraTop ?? 0)}px)
					scale(${props.transforms.scale})
					${props.transforms.rotate ? `rotate(${props.transforms.rotate}deg)` : ''}
				`,
				transitionDelay: `${props.transforms.delay}ms, ${props.transforms.delay}ms`,
				transitionDuration: `${props.transforms?.duration ?? 500}ms`,
				filter: props.transforms?.blur ? `blur(${props.transforms?.blur}px)` : 'none',
				opacity: props.transforms?.opacity ?? 1,
				...props.transforms?.outOfRangeHidden && { visibility: 'hidden' }
			}}>
			<div className="rnp-contributors-inner">
				{
					(contributors?.roles ?? []).map((role: any, index: number) => {
						return <Artist key={index} role={role} />
					})
				}
				<Contributor text="歌词贡献者" user={contributors?.original} />
				<Contributor text="翻译贡献者" user={contributors?.translation} />
				<Contributor text="歌词来源" user={contributors?.lyricSource} />
			</div>
		</div>
	);
}
