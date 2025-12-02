import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { mountStore, MountPoint } from './core/mount-store';
import { Background } from './components/background/background';
import { Lyrics } from './components/lyrics/lyrics';
import { CoverShadow } from './components/cover-shadow/cover-shadow';
import { MiniSongInfo } from './components/mini-song-info/mini-song-info';
import { getSetting } from './modules/settings/storage';

export const App = () => {
    const [mounts, setMounts] = useState<{ [key in MountPoint]?: { container: HTMLElement, data?: any } }>({});

    useEffect(() => {
        const update = () => {
            setMounts({
                background: mountStore.get('background') || undefined,
                coverShadow: mountStore.get('coverShadow') || undefined,
                lyrics: mountStore.get('lyrics') || undefined,
                miniSongInfo: mountStore.get('miniSongInfo') || undefined,
                fmLyrics: mountStore.get('fmLyrics') || undefined,
                fmBackground: mountStore.get('fmBackground') || undefined
            });
        };
        update();
        const unsubscribe = mountStore.subscribe(update);
        return () => { unsubscribe(); };
    }, []);

    return (
        <>
            {mounts.background && ReactDOM.createPortal(
                <Background
                    type={getSetting('background-type', 'fluid')}
                    image={mounts.background.data.image}
                />,
                mounts.background.container
            )}
             {mounts.coverShadow && ReactDOM.createPortal(
                <CoverShadow image={mounts.coverShadow.data.image} />,
                mounts.coverShadow.container
            )}
            {mounts.lyrics && ReactDOM.createPortal(
                <Lyrics />,
                mounts.lyrics.container
            )}
            {mounts.miniSongInfo && ReactDOM.createPortal(
                <MiniSongInfo
                    image={mounts.miniSongInfo.data.image}
                    infContainer={mounts.miniSongInfo.data.infContainer}
                />,
                mounts.miniSongInfo.container
            )}
            {/* FM Mode */}
            {mounts.fmLyrics && ReactDOM.createPortal(
                <Lyrics isFM={true} />,
                mounts.fmLyrics.container
            )}
            {mounts.fmBackground && ReactDOM.createPortal(
                <Background
                    type={getSetting('background-type', 'fluid')}
                    image={mounts.fmBackground.data.image}
                    isFM={true}
                    imageChangedCallback={mounts.fmBackground.data.imageChangedCallback}
                />,
                mounts.fmBackground.container
            )}
        </>
    );
};
