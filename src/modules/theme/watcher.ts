import { calcAccentColor } from './palette';

let lastCDImage = '';

/**
 * 监控CD图片变化并更新主题色
 * Monitor CD image changes and update accent color
 */
export const updateCDImage = () => {
    if (!document.querySelector('.g-single')) {
        return;
    }
    
    const imgDom = document.querySelector('.n-single .cdimg img') as HTMLImageElement;
    if (!imgDom) {
        return;
    }

    const realCD = document.querySelector('.n-single .cdimg');

    const update = () => {
        const cdImage = imgDom.src;
        if (cdImage === lastCDImage) {
            return;
        }
        lastCDImage = cdImage;
        calcAccentColor(imgDom);
    }

    if (imgDom.complete) {
        update();
        realCD?.classList.remove('loading');
    } else {
        realCD?.classList.add('loading');
    }
}

/**
 * 监听系统主题变化
 * Listen system theme change
 */
export const initSystemThemeListener = () => {
    const toggleSystemDarkmodeClass = (media: MediaQueryList) => {
        document.body.classList.add(media.matches ? 'rnp-system-dark' : 'rnp-system-light');
        document.body.classList.remove(media.matches ? 'rnp-system-light' : 'rnp-system-dark');
        if (document.body.classList.contains('rnp-system-dynamic-theme-auto')) {
            window.mdThemeType = media.matches ? 'dark' : 'light';
        }
    };
    const systemDarkmodeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    systemDarkmodeMedia.addEventListener('change', () => { toggleSystemDarkmodeClass(systemDarkmodeMedia); });
    toggleSystemDarkmodeClass(systemDarkmodeMedia);
}
