import React from 'react';
import ReactDOM from 'react-dom';
import { waitForElement, waitForElementAsync, copyTextToClipboard } from '../../utils/dom';
import { showContextMenu, ContextMenuItem } from '../../components/context-menu/context-menu';
import { updateCDImage, calcAccentColor } from '../theme';
import { addSettingsMenu } from '../settings/ui';
import { addFullScreenButton } from './fullscreen';
import { whatsNew } from '../../components/whats-new/whats-new';
import { getSetting } from '../settings/storage';
import { App } from '../../App';
import { mountStore } from '../../core/mount-store';

declare const betterncm: any;

let appMounted = false;
const initApp = () => {
    if (appMounted) return;
    const root = document.createElement('div');
    root.id = 'rnp-app-root';
    document.body.appendChild(root);
    // @ts-ignore
    ReactDOM.render(<App />, root);
    appMounted = true;
}

export const patchNowPlaying = () => {
    new MutationObserver(async () => { // Now playing page
        if (document.querySelector('.g-single:not(.patched)')) {
            document.querySelector('.g-single')?.classList.add('patched');
            
            initApp();

            waitForElement('.n-single .cdimg img', (dom: HTMLElement) => {
                if (!dom) {
                    console.error('Refined Now Playing: .n-single .cdimg img not found in callback');
                    return;
                }
                try {
                    const imgDom = dom as HTMLImageElement;
                    imgDom.addEventListener('load', updateCDImage);
                    new MutationObserver(updateCDImage).observe(imgDom, {attributes: true, attributeFilter: ['src']});

                    imgDom.addEventListener('contextmenu', (e) => {
                        try {
                            e.preventDefault();
                            e.stopPropagation();
                            const imageURL = imgDom.src.replace(/^orpheus:\/\/cache\/\?/, '').replace(/\?.*$/, '');
                            showContextMenu(e.clientX, e.clientY, [
                                {
                                    label: '复制图片地址',
                                    callback: () => {
                                        copyTextToClipboard(imageURL);
                                    }
                                },
                                {
                                    label: '在浏览器中打开图片',
                                    callback: () => {
                                        betterncm.app.exec(`${imageURL}`);
                                    }
                                }
                            ]);					
                        } catch (error) {
                            console.error('Refined Now Playing: Error in contextmenu handler for cdimg', error);
                        }
                    });
                } catch (error) {
                    console.error('Refined Now Playing: Error attaching listeners to cdimg', error);
                }
            });

            waitForElement('.g-single .g-singlec-ct .n-single .mn .head .inf', (dom: HTMLElement) => {
                if (!dom) {
                    console.error('Refined Now Playing: .g-single .g-singlec-ct .n-single .mn .head .inf not found in callback');
                    return;
                }
                const addCopySelectionToItems = (items: ContextMenuItem[], closetSelector: string) => {
                    try {
                        const selection = window.getSelection();
                        if (selection && selection.toString().trim() && (selection as any).baseNode?.parentElement?.closest(closetSelector)) {
                            const selectedText = selection.toString().trim();												
                            items.unshift({
                                label: '复制',
                                callback: () => {
                                    copyTextToClipboard(selectedText);
                                }
                            });
                        }
                    } catch (error) {
                        console.error('Refined Now Playing: Error in addCopySelectionToItems', error);
                    }
                };
                try {
                    dom.addEventListener('contextmenu', (e: MouseEvent) => {
                        try {
                            e.preventDefault();
                            e.stopPropagation();

                            const target = e.target as HTMLElement;
                            if (target.closest('.title .name')) {
                                const songName = (dom.querySelector('.title .name') as HTMLElement).innerText;
                                const items: ContextMenuItem[] = [
                                    {
                                        label: '复制歌曲名',
                                        callback: () => {
                                            copyTextToClipboard(songName);
                                        }
                                    }
                                ];
                                addCopySelectionToItems(items, '.title .name');
                                showContextMenu(e.clientX, e.clientY, items);
                                return;
                            }

                            if (target.closest('.info .alias')) {
                                const songAlias = (dom.querySelector('.info .alias') as HTMLElement).innerText;
                                const items: ContextMenuItem[] = [
                                    {
                                        label: '复制歌曲别名',
                                        callback: () => {
                                            copyTextToClipboard(songAlias);
                                        }
                                    }
                                ];
                                addCopySelectionToItems(items, '.info .alias');
                                showContextMenu(e.clientX, e.clientY, items);
                                return;
                            }
                        } catch (error) {
                            console.error('Refined Now Playing: Error in contextmenu handler for song info', error);
                        }
                    });
                } catch (error) {
                    console.error('Refined Now Playing: Error attaching listeners to song info', error);
                }
            });


            const background = document.createElement('div');
            background.classList.add('rnp-bg');
            const bgImg = await waitForElementAsync('.n-single .cdimg img');
            mountStore.set('background', background, { image: bgImg });
            document.querySelector('.g-single')?.appendChild(background);

            const coverShadowController = document.createElement('div');
            coverShadowController.classList.add('rnp-cover-shadow-controller');
            mountStore.set('coverShadow', coverShadowController, { image: await waitForElementAsync('.n-single .cdimg img') });
            document.body.appendChild(coverShadowController);


            waitForElement('.g-single-track .g-singlec-ct .n-single .mn .lyric', (oldLyrics: HTMLElement) => {
                oldLyrics.style.display = 'none';
                oldLyrics.classList.add('rnp-hidden-original-lyric');
            });
            const lyrics = document.createElement('div');
            lyrics.classList.add('lyric');
            mountStore.set('lyrics', lyrics);
            waitForElement('.g-single-track .g-singlec-ct .n-single .wrap', (dom: HTMLElement) => {
                dom.appendChild(lyrics);
            });

            const miniSongInfo = document.createElement('div');
            miniSongInfo.classList.add('rnp-mini-song-info');
            setTimeout(async () => {
                mountStore.set('miniSongInfo', miniSongInfo, {
                    image: await waitForElementAsync('.n-single .cdimg img'),
                    infContainer: await waitForElementAsync('.g-single .g-singlec-ct .n-single .mn .head .inf')
                });
                document.querySelector('.g-single')?.appendChild(miniSongInfo);
            }, 0);

            addSettingsMenu();
            addFullScreenButton(document.querySelector('.g-single'));

            whatsNew();
        }
    }).observe(document.body, { childList: true });
}

export const patchFM = async () => {
    let FMObserver = new MutationObserver(async () => {
        if (document.querySelector('#page_pc_userfm_songplay:not(.patched)')) {
            document.querySelector('#page_pc_userfm_songplay')?.classList.add('patched');
            FMObserver.disconnect();
            
            initApp();

            const lyrics = document.createElement('div');
            lyrics.classList.add('lyric');
            document.querySelector('#page_pc_userfm_songplay')?.appendChild(lyrics);
            mountStore.set('fmLyrics', lyrics);
            
            for (let i = 0; i < 15; i++) {
                setTimeout(() => {
                    window.dispatchEvent(new Event('resize'));
                }, 200 * i);
            }

            const background = document.createElement('div');
            background.classList.add('rnp-bg', 'fm-bg');
            mountStore.set('fmBackground', background, {
                image: await waitForElementAsync('#page_pc_userfm_songplay .fmplay .covers'),
                imageChangedCallback: (dom: any) => {
                    if (!dom) return;
                    calcAccentColor(dom, true);
                }
            });
            document.querySelector('#page_pc_userfm_songplay')?.appendChild(background);
            addSettingsMenu(true);
        }
    });

    window.addEventListener('hashchange', async () => {
        if (!window.location.hash.startsWith('#/m/fm/')) {
            FMObserver.disconnect();
            return;
        }
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                window.dispatchEvent(new Event('recalc-lyrics'));
                window.dispatchEvent(new Event('recalc-title'));
            }, 50 * i);
        }
        FMObserver.observe(document.body, { childList: true });
        window.dispatchEvent(new Event('recalc-lyrics'));
    });
}

export const initThemeFix = () => {
    // Fix incomptibility with light theme
    // 修复与浅色主题的不兼容问题
    const lightThemeFixStyle = document.createElement('link');
    lightThemeFixStyle.rel = 'stylesheet';
    document.head.appendChild(lightThemeFixStyle);
    new MutationObserver(() => {
        if (document.body.classList.contains('mq-playing')) {
            if (lightThemeFixStyle.href !== 'orpheus://orpheus/style/res/less/default/css/skin.ls.css') {
                lightThemeFixStyle.href = 'orpheus://orpheus/style/res/less/default/css/skin.ls.css';
            }
        } else {
            if (lightThemeFixStyle.href !== '') {
                lightThemeFixStyle.href = '';
            }
        }
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });


    let previousHasClass = document.body.classList.contains('mq-playing');
    new MutationObserver(() => {
        const hasClass = document.body.classList.contains('mq-playing');
        if (hasClass !== previousHasClass) {
            previousHasClass = hasClass;
            if (hasClass) {
                for (let i = 0; i < 10; i++) {
                    setTimeout(() => {
                        window.dispatchEvent(new Event('recalc-lyrics'));
                        window.dispatchEvent(new Event('recalc-title'));
                    }, 50 * i);
                }
            }
        }
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

    new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    if ((node as HTMLElement).classList && (node as HTMLElement).classList.contains('g-single')) {
                        document.body.classList.add('mq-playing');
                        (node as HTMLElement).classList.add('z-show');
                    }
                });
            }
        });
    }).observe(document.body, { childList: true });
}
