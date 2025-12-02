// @ts-ignore
import settingsMenuHTML from '../../components/settings/settings-menu.html';
import { FontSettings } from '../../components/font-settings/font-settings';
import { whatsNew } from '../../components/whats-new/whats-new';
import { compatibilityWizard, hijackFailureNoticeCheck } from '../../components/compatibility/compatibility-check';
import { recalcAccentColor } from '../theme/palette';
import { getSetting, setSetting } from './storage';
import { 
    addOrRemoveGlobalClassByOption, 
    bindCheckboxToClass, 
    bindSelectGroupToClasses, 
    bindSliderToCSSVariable, 
    bindSliderToFunction, 
    bindCheckboxToFunction,
    initTabs
} from './helpers';
import React from 'react';
import { createRoot } from 'react-dom/client';

declare const loadedPlugins: any;

const shouldSettingMenuReload = [true, true]; // index = int(isFM)

/**
 * 添加设置菜单
 * Add settings menu
 * @param {boolean} isFM - 是否为私人FM模式 / Is FM mode
 */
export const addSettingsMenu = async (isFM: boolean = false) => {
    if (shouldSettingMenuReload[isFM ? 1 : 0]) {
        shouldSettingMenuReload[isFM ? 1 : 0] = false;
    } else {
        return;
    }

    const getOptionDom = (selector: string): any => {
        if (isFM) return document.querySelector(`${selector}-fm`);
        return document.querySelector(selector);
    }


    const initSettings = () => {
        // 外观
        // Appearance
        const exclusiveModes = getOptionDom('#exclusive-modes');
        const centerLyric = getOptionDom('#center-lyric');
        const autoHideMiniSongInfo = getOptionDom('#auto-hide-mini-song-info');
        const colorScheme = getOptionDom('#color-scheme');
        const accentColorVariant = getOptionDom('#accent-color-variant');
        const textShadow = getOptionDom('#text-shadow');
        const textGlow = getOptionDom('#text-glow');
        const refinedControlBar = getOptionDom('#refined-control-bar');
        const alwaysShowBottomBar = getOptionDom('#always-show-bottombar');
        const bottomProgressBar = getOptionDom('#bottom-progressbar');
        const enableProgressbarPreview = getOptionDom('#enable-progressbar-preview');
        bindSelectGroupToClasses(exclusiveModes, 'none', (x) => x === 'all' ? 'no-exclusive-mode' : x, () => {
            window.dispatchEvent(new Event('recalc-lyrics'));
            // recalculateTitleSize(); // TODO: Move to UI module
             window.dispatchEvent(new Event('recalc-title'));
        }, isFM, shouldSettingMenuReload);
        bindCheckboxToClass(centerLyric, 'center-lyric', false, () => {}, isFM, shouldSettingMenuReload);
        bindCheckboxToClass(autoHideMiniSongInfo, 'auto-hide-mini-song-info', true, () => {}, isFM, shouldSettingMenuReload);
        bindSelectGroupToClasses(colorScheme, 'auto', (x) => `rnp-${x}`, undefined, isFM, shouldSettingMenuReload);
        bindSelectGroupToClasses(accentColorVariant, 'primary', (x) => `accent-color-${x}`, (x) => {
            if (x == 'off') document.body.classList.remove('enable-accent-color');
            else document.body.classList.add('enable-accent-color');
            window.accentColorVariant = (x == 'off') ? 'primary' : x;
            recalcAccentColor();
        }, isFM, shouldSettingMenuReload);
        bindCheckboxToClass(textShadow, 'rnp-shadow', false, (x) => {
            if (x) {
                textGlow.checked = false;
                textGlow.dispatchEvent(new Event('change'));
            }
        }, isFM, shouldSettingMenuReload);
        bindCheckboxToClass(textGlow, 'rnp-text-glow', false, (x) => {
            if (x) {
                textShadow.checked = false;
                textShadow.dispatchEvent(new Event('change'));
            }
        }, isFM, shouldSettingMenuReload);
        bindCheckboxToClass(refinedControlBar, 'refined-control-bar', true, () => {}, isFM, shouldSettingMenuReload);
        bindCheckboxToClass(alwaysShowBottomBar, 'always-show-bottombar', false, () => {}, isFM, shouldSettingMenuReload);
        bindCheckboxToClass(bottomProgressBar, 'rnp-bottom-progressbar', false, () => {}, isFM, shouldSettingMenuReload);
        bindCheckboxToClass(enableProgressbarPreview, 'enable-progressbar-preview', true, () => {}, isFM, shouldSettingMenuReload);


        // 封面
        // Cover
        const horizontalAlign = getOptionDom('#horizontal-align');
        const verticalAlign = getOptionDom('#vertical-align');
        const rectangleCover = getOptionDom('#rectangle-cover');
        const albumSize = getOptionDom('#album-size');
        const coverBlurryShadow = getOptionDom('#cover-blurry-shadow');
        bindSelectGroupToClasses(horizontalAlign, 'left', (x) => { return `horizontal-align-${x}` }, () => { window.dispatchEvent(new Event('recalc-title'));}, isFM, shouldSettingMenuReload);
        bindSelectGroupToClasses(verticalAlign, 'bottom', (x) => { return `vertical-align-${x}` }, () => { window.dispatchEvent(new Event('recalc-title'));}, isFM, shouldSettingMenuReload);
        bindCheckboxToClass(rectangleCover, 'rectangle-cover', true, () => {}, isFM, shouldSettingMenuReload);
        bindSliderToFunction(albumSize, (x) => {
            window.albumSize = x;
            const img = getOptionDom('.n-single .cdimg img');// ?? getOptionDom('.m-fm .fmplay .covers .cvr.j-curr');
            if (!img?.src) return;
            const currentSrc = img.src;
            const newSrc = currentSrc.replace(/thumbnail=\d+y\d+/g, `thumbnail=${window.albumSize}y${window.albumSize}`);
            if (currentSrc !== newSrc) {
                img.src = newSrc;
            }
        }, 200, 'change', (x) => { return x === 200 ? 210 : x }, '', isFM, shouldSettingMenuReload);
        bindCheckboxToClass(coverBlurryShadow, 'cover-blurry-shadow', true, (x) => {
            document.dispatchEvent(new CustomEvent('rnp-cover-shadow-type', { detail: { type: x ? 'colorful' : 'black' } }));
        }, isFM, shouldSettingMenuReload);

        // 背景
        // Background
        const backgroundType = getOptionDom('#background-type');
        const bgBlur = getOptionDom('#bg-blur');
        const bgDim = getOptionDom('#bg-dim');
        const bgDimForGradientBg = getOptionDom('#bg-dim-for-gradient-bg');
        const bgDimForFluidBg = getOptionDom('#bg-dim-for-fluid-bg');
        const bgBlurForNoneBgMask = getOptionDom('#bg-blur-for-none-bg-mask');
        const bgDimForNoneBgMask = getOptionDom('#bg-dim-for-none-bg-mask');
        const bgOpacity = getOptionDom('#bg-opacity');
        const gradientBgDynamic = getOptionDom('#gradient-bg-dynamic');
        const staticFluid = getOptionDom('#static-fluid');
        bindSelectGroupToClasses(backgroundType, 'blur', (x) => `rnp-bg-${x}`, (x) => {
            document.dispatchEvent(new CustomEvent('rnp-background-type', { detail: { type: x } }));
        }, isFM, shouldSettingMenuReload);
        bindSliderToCSSVariable(bgBlur, '--bg-blur', 90, 'change', (x) => { return `${x}px` }, '', isFM, shouldSettingMenuReload);
        bindSliderToCSSVariable(bgDim, '--bg-dim', 55, 'change', (x) => { return x / 100 }, '', isFM, shouldSettingMenuReload);
        bindSliderToCSSVariable(bgDimForGradientBg, '--bg-dim-for-gradient-bg', 45, 'change', (x) => { return x / 100 }, '', isFM, shouldSettingMenuReload);
        bindSliderToCSSVariable(bgDimForFluidBg, '--bg-dim-for-fluid-bg', 30, 'change', (x) => { return x / 100 }, '', isFM, shouldSettingMenuReload);
        bindSliderToCSSVariable(bgBlurForNoneBgMask, '--bg-blur-for-none-bg-mask', 0, 'change', (x) => { return `${x}px` }, '', isFM, shouldSettingMenuReload);
        bindSliderToCSSVariable(bgDimForNoneBgMask, '--bg-dim-for-none-bg-mask', 0, 'change', (x) => { return x / 100 }, '', isFM, shouldSettingMenuReload);
        bindSliderToCSSVariable(bgOpacity, '--bg-opacity', 0, 'change', (x) => { return 1 - x / 100 }, '', isFM, shouldSettingMenuReload);
        bindCheckboxToClass(gradientBgDynamic, 'gradient-bg-dynamic', true, () => {}, isFM, shouldSettingMenuReload);
        bindCheckboxToClass(staticFluid, 'static-fluid', false, (x) => {
            document.dispatchEvent(new CustomEvent('rnp-static-fluid', { detail: x }));
        }, isFM, shouldSettingMenuReload);

        // 歌词
        // Lyrics
        const originalLyricBold = getOptionDom('#original-lyric-bold');
        const lyricFontSize = getOptionDom('#lyric-font-size');
        const lyricRomajiSizeEm = getOptionDom('#lyric-romaji-size-em');
        const lyricTranslationSizeEm = getOptionDom('#lyric-translation-size-em');
        const lyricFade = getOptionDom('#lyric-fade');
        const lyricZoom = getOptionDom('#lyric-zoom');
        const lyricBlur = getOptionDom('#lyric-blur');
        const lyricRotate = getOptionDom('#lyric-rotate');
        const RotateCurvature = getOptionDom('#rotate-curvature');
        const karaokeAnimation = getOptionDom('#karaoke-animation');
        const currentLyricAlignmentPercentage = getOptionDom('#current-lyric-alignment-percentage');
        const lyricStagger = getOptionDom('#lyric-stagger');
        const lyricAnimationTiming = getOptionDom('#lyric-animation-timing');
        const lyricGlow = getOptionDom('#lyric-glow');
        const lyricContributorsDisplay = getOptionDom('#lyric-contributors-display');
        

        bindCheckboxToClass(originalLyricBold, 'original-lyric-bold', true, () => {}, isFM, shouldSettingMenuReload);

        bindSliderToFunction(lyricFontSize, (x) => {
            document.dispatchEvent(new CustomEvent('rnp-lyric-font-size', { detail: x }));
        }, 32, 'change', undefined, '', isFM, shouldSettingMenuReload);
        bindSliderToFunction(lyricRomajiSizeEm, (x) => {
            document.body.style.setProperty('--lyric-romaji-size-em', `${x}em`);
            window.dispatchEvent(new Event('recalc-lyrics'));
        }, 0.6, 'change', undefined, '', isFM, shouldSettingMenuReload);
        bindSliderToFunction(lyricTranslationSizeEm, (x) => {
            document.body.style.setProperty('--lyric-translation-size-em', `${x}em`);
            window.dispatchEvent(new Event('recalc-lyrics'));
        }, 1.0, 'change', undefined, '', isFM, shouldSettingMenuReload);

        bindCheckboxToFunction(lyricZoom, (x) => {
            document.dispatchEvent(new CustomEvent('rnp-lyric-zoom', { detail: x }));
        }, false, isFM, shouldSettingMenuReload);
        bindCheckboxToFunction(lyricFade, (x) => {
            document.dispatchEvent(new CustomEvent('rnp-lyric-fade', { detail: x }));
        }, false, isFM, shouldSettingMenuReload);
        bindCheckboxToFunction(lyricBlur, (x) => {
            document.dispatchEvent(new CustomEvent('rnp-lyric-blur', { detail: x }));
        }, false, isFM, shouldSettingMenuReload);
        bindCheckboxToClass(lyricRotate, 'lyric-rotate', false, (x) => {
            document.dispatchEvent(new CustomEvent('rnp-lyric-rotate', { detail: x }));
        }, isFM, shouldSettingMenuReload);
        bindSliderToFunction(RotateCurvature, (x) => {
            document.dispatchEvent(new CustomEvent('rnp-rotate-curvature', { detail: x }));
        }, 25, 'change', undefined, '', isFM, shouldSettingMenuReload);
        bindSelectGroupToClasses(karaokeAnimation, 'float', (x) => `rnp-karaoke-animation-${x}`, (x) => {
            document.dispatchEvent(new CustomEvent('rnp-karaoke-animation', { detail: x }));
        }, isFM, shouldSettingMenuReload);
        bindSelectGroupToClasses(currentLyricAlignmentPercentage, '50', (x) => `rnp-current-lyric-alignment-${x}`, (x) => {
            document.dispatchEvent(new CustomEvent('rnp-current-lyric-alignment-percentage', { detail: parseInt(x) }));
        }, isFM, shouldSettingMenuReload);
        bindCheckboxToFunction(lyricStagger, (x) => {
            document.dispatchEvent(new CustomEvent('rnp-lyric-stagger', { detail: x }));
        }, true, isFM, shouldSettingMenuReload);
        bindSelectGroupToClasses(lyricAnimationTiming, 'smooth', (x) => `rnp-lyric-animation-timing-${x}`, undefined, isFM, shouldSettingMenuReload);
        bindCheckboxToFunction(lyricGlow, (x) => {
            document.dispatchEvent(new CustomEvent('rnp-lyric-glow', { detail: x }));
        }, true, isFM, shouldSettingMenuReload);
        bindSelectGroupToClasses(lyricContributorsDisplay, 'hover', (x) => `rnp-lyric-contributors-${x}`, undefined, isFM, shouldSettingMenuReload);

        const lyricOffsetSlider = getOptionDom('#rnp-lyric-offset-slider');
        const lyricOffsetAdd = getOptionDom('#rnp-lyric-offset-add');
        const lyricOffsetSub = getOptionDom('#rnp-lyric-offset-sub');
        const lyricOffsetReset = getOptionDom('#rnp-lyric-offset-reset');
        const lyricOffsetNumber = getOptionDom('#rnp-lyric-offset-number');
        const lyricOffsetTip = getOptionDom('#rnp-lyric-offset-tip');
        bindSliderToFunction(lyricOffsetSlider, (ms) => {
            ms = parseInt(ms);
            document.dispatchEvent(new CustomEvent('rnp-global-offset', { detail: ms }));
            lyricOffsetNumber.innerHTML = `${['-', '', '+'][Math.sign(ms) + 1]}${(Math.abs(ms) / 1000).toFixed(1).replace(/\.0$/, '')}s`;
            if (ms === 0) lyricOffsetTip.innerHTML = '未设置';
            else lyricOffsetTip.innerHTML = (ms > 0 ? '歌词提前' : '歌词滞后');
            if (ms === 0) lyricOffsetReset.classList.remove('active');
            else lyricOffsetReset.classList.add('active');
            shouldSettingMenuReload[isFM ? 1 : 0] = true;
            setSetting('lyric-offset', ms);
        }, parseInt(getSetting('lyric-offset', 0)), 'change', undefined, '', isFM, shouldSettingMenuReload);

        const setLyricOffsetValue = (ms: number) => {
            lyricOffsetSlider.value = ms;
            lyricOffsetSlider.dispatchEvent(new Event('input'));
            lyricOffsetSlider.dispatchEvent(new Event('change'));
        };
        lyricOffsetAdd.addEventListener('click', () => {
            setLyricOffsetValue(parseInt(getSetting('lyric-offset', 0)) + 100);
        });
        lyricOffsetSub.addEventListener('click', () => {
            setLyricOffsetValue(parseInt(getSetting('lyric-offset', 0)) - 100);
        });
        lyricOffsetReset.addEventListener('click', () => {
            setLyricOffsetValue(0);
        });

        // 字体
        // Font
        const customFont = getOptionDom('#custom-font');
        bindCheckboxToClass(customFont, 'rnp-custom-font', false, () => {}, isFM, shouldSettingMenuReload);
        const customFontSectionContainer = getOptionDom('#rnp-custom-font-section');
        const containerRoot = createRoot(customFontSectionContainer);
        containerRoot.render(<FontSettings />);

        // 实验性选项
        // Experimental
        const fluidMaxFramerate = getOptionDom('#fluid-max-framerate');
        const fluidBlur = getOptionDom('#fluid-blur');
        const hideEntireBottombar = getOptionDom('#hide-entire-bottombar-when-idle');
        const presentationMode = getOptionDom('#presentation-mode');
        bindSliderToFunction(fluidMaxFramerate, (x) => {
            x = parseInt(x);
            const arr = ['5', '10', '30', '60', 'inf'];
            for (let i = 0; i <= 4; i++) {
                document.body.classList.remove(`rnp-fluid-max-framerate-${arr[i]}`);
            }
            document.body.classList.add(`rnp-fluid-max-framerate-${arr[x]}`);
        }, getSetting('fluid-max-framerate', 5), 'change', undefined, '', isFM, shouldSettingMenuReload);
        bindSliderToCSSVariable(fluidBlur, '--fluid-blur', 6, 'change', (x) => `${parseInt(Math.pow(2, x) as any)}px`, '', isFM, shouldSettingMenuReload);
        bindCheckboxToClass(hideEntireBottombar, 'hide-entire-bottombar-when-idle', false, () => {}, isFM, shouldSettingMenuReload);
        presentationMode.addEventListener("change", (e: any) => {
            addOrRemoveGlobalClassByOption('presentation-mode', e.target.checked);
        });

        // 杂项
        // Misc
        const hideSongAliasName = getOptionDom('#hide-song-alias-name');
        const hideComments = getOptionDom('#hide-comments');
        const partialBg = getOptionDom('#partial-bg');
        bindCheckboxToClass(hideSongAliasName, 'hide-song-alias-name', false, () => {}, isFM, shouldSettingMenuReload);
        bindCheckboxToClass(hideComments, 'hide-comments', false, () => {}, isFM, shouldSettingMenuReload);
        bindCheckboxToClass(partialBg, 'partial-bg', false, () => {}, isFM, shouldSettingMenuReload);

        // 关于
        // About
        const versionNumber = getOptionDom('#rnp-version-number');
        versionNumber.innerHTML = loadedPlugins.RefinedNowPlaying.manifest.version;
        const openWhatsNew = getOptionDom('#open-whats-new');
        openWhatsNew.addEventListener('click', () => {
            whatsNew(true);
        });
    }

    const settingsMenu = document.createElement('div');
    if (isFM) {
        settingsMenu.id = 'settings-menu-fm';
        settingsMenu.innerHTML = settingsMenuHTML.replace(/(id|for)="(.*?)"/gi, '$1="$2-fm"');
    } else {
        settingsMenu.id = 'settings-menu';
        settingsMenu.innerHTML = settingsMenuHTML;
    }

    if (document.querySelector(`#${settingsMenu.id}`)) {
        document.querySelector(`#${settingsMenu.id}`)?.remove();
    }

    if (!isFM) document.querySelector('.g-single')?.appendChild(settingsMenu);
    else document.querySelector('#page_pc_userfm_songplay')?.appendChild(settingsMenu);
    initSettings();
    initTabs(settingsMenu);
    hijackFailureNoticeCheck();
};
