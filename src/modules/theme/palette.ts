import { themeFromSourceColor, QuantizerCelebi, Hct, Score } from "@material/material-color-utilities";
import { argb2Rgb, rgb2Argb } from '../../utils/color-utils';
import { chunk } from '../../utils/common';
import { CSS_VARS } from '../../constants/theme';

/**
 * 更新主题色变量
 * Update accent color variables
 * @param {string} name - 变量名 / Variable name
 * @param {number} argb - ARGB 颜色值 / ARGB color value
 * @param {boolean} isFM - 是否为私人FM模式 / Is FM mode
 */
export const updateAccentColor = (name: string, argb: number, isFM: boolean = false) => {
    const [r, g, b] = [...argb2Rgb(argb)];
    if (isFM) {
        document.body.style.setProperty(`${name}-fm`, `rgb(${r}, ${g}, ${b})`);
        document.body.style.setProperty(`${name}-rgb-fm`, `${r}, ${g}, ${b}`);
        return;
    }
    document.body.style.setProperty(name, `rgb(${r}, ${g}, ${b})`);
    document.body.style.setProperty(`${name}-rgb`, `${r}, ${g}, ${b}`);
}

/**
 * 使用灰色作为备用主题色
 * Use grey as fallback accent color
 * @param {boolean} isFM - 是否为私人FM模式 / Is FM mode
 */
export const useGreyAccentColor = (isFM: boolean = false) => {
    updateAccentColor(CSS_VARS.ACCENT_COLOR_DARK, rgb2Argb(150, 150, 150), isFM);
    updateAccentColor(CSS_VARS.ACCENT_COLOR_ON_PRIMARY_DARK, rgb2Argb(10, 10, 10), isFM);
    updateAccentColor(CSS_VARS.ACCENT_COLOR_SHADE_1_DARK, rgb2Argb(210, 210, 210), isFM);
    updateAccentColor(CSS_VARS.ACCENT_COLOR_SHADE_2_DARK, rgb2Argb(255, 255, 255), isFM);
    updateAccentColor(CSS_VARS.ACCENT_COLOR_BG_DARK, rgb2Argb(50, 50, 50), isFM);

    updateAccentColor(CSS_VARS.ACCENT_COLOR_LIGHT, rgb2Argb(120, 120, 120), isFM);
    updateAccentColor(CSS_VARS.ACCENT_COLOR_ON_PRIMARY_LIGHT, rgb2Argb(250, 250, 250), isFM);
    updateAccentColor(CSS_VARS.ACCENT_COLOR_SHADE_1_LIGHT, rgb2Argb(40, 40, 40), isFM);
    updateAccentColor(CSS_VARS.ACCENT_COLOR_SHADE_2_LIGHT, rgb2Argb(20, 20, 20), isFM);
    updateAccentColor(CSS_VARS.ACCENT_COLOR_BG_LIGHT, rgb2Argb(190, 190, 190), isFM);
}

let lastDom: HTMLImageElement | null = null;
let lastIsFM: boolean = false;

/**
 * 计算并应用主题色
 * Calculate and apply accent color from image
 * @param {HTMLElement} dom - 图片DOM元素 / Image DOM element
 * @param {boolean} isFM - 是否为私人FM模式 / Is FM mode
 */
export const calcAccentColor = (dom: HTMLImageElement, isFM: boolean = false) => {
    lastDom = dom.cloneNode(true) as HTMLImageElement;
    lastIsFM = isFM;

    const canvas = document.createElement('canvas');
    canvas.width = 50;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(dom, 0, 0, dom.naturalWidth, dom.naturalHeight, 0, 0, 50, 50);
    const imageData = ctx.getImageData(0, 0, 50, 50).data;
    const pixels = chunk(Array.from(imageData), 4).map((pixel: any) => {
        return ((pixel[3] << 24 >>> 0) | (pixel[0] << 16 >>> 0) | (pixel[1] << 8 >>> 0) | pixel[2]) >>> 0;
    });
    const quantizedColors = QuantizerCelebi.quantize(pixels, 128);
    const sortedQuantizedColors = Array.from(quantizedColors).sort((a: any, b: any) => b[1] - a[1]);

    const mostFrequentColors = sortedQuantizedColors.slice(0, 5).map((x: any) => argb2Rgb(x[0]));
    if (mostFrequentColors.every((x: any) => Math.max(...x) - Math.min(...x) < 5)) {
        useGreyAccentColor(isFM);
        return;
    }

    const ranked = Score.score(new Map(sortedQuantizedColors.slice(0, 50) as any));
    const top = ranked[0];
    const theme = themeFromSourceColor(top);

    const variant = (window.accentColorVariant as keyof typeof theme.palettes) ?? 'primary';

    updateAccentColor(CSS_VARS.ACCENT_COLOR_DARK, (theme.schemes.dark as any)[variant], isFM);
    updateAccentColor(CSS_VARS.ACCENT_COLOR_ON_PRIMARY_DARK, (Hct.from(theme.palettes[variant].hue, theme.palettes[variant].chroma, 20)).toInt(), isFM);
    updateAccentColor(CSS_VARS.ACCENT_COLOR_SHADE_1_DARK, (Hct.from(theme.palettes[variant].hue, theme.palettes[variant].chroma, 80)).toInt(), isFM);
    updateAccentColor(CSS_VARS.ACCENT_COLOR_SHADE_2_DARK, (Hct.from(theme.palettes[variant].hue, theme.palettes[variant].chroma, 90)).toInt(), isFM);
    updateAccentColor(CSS_VARS.ACCENT_COLOR_BG_DARK, (Hct.from(theme.palettes.secondary.hue, theme.palettes.secondary.chroma, 20)).toInt(), isFM);

    updateAccentColor(CSS_VARS.ACCENT_COLOR_LIGHT, theme.schemes.light.onPrimaryContainer, isFM);
    updateAccentColor(CSS_VARS.ACCENT_COLOR_ON_PRIMARY_LIGHT, (Hct.from(theme.palettes[variant].hue, theme.palettes[variant].chroma, 100)).toInt(), isFM);
    updateAccentColor(CSS_VARS.ACCENT_COLOR_SHADE_1_LIGHT, (Hct.from(theme.palettes[variant].hue, theme.palettes[variant].chroma, 25)).toInt(), isFM);
    updateAccentColor(CSS_VARS.ACCENT_COLOR_SHADE_2_LIGHT, (Hct.from(theme.palettes[variant].hue, theme.palettes[variant].chroma, 15)).toInt(), isFM);
    updateAccentColor(CSS_VARS.ACCENT_COLOR_BG_LIGHT, (Hct.from(theme.palettes.secondary.hue, theme.palettes.secondary.chroma, 90)).toInt(), isFM);
}

export const recalcAccentColor = () => {
    if (lastDom) {
        calcAccentColor(lastDom, lastIsFM);
    }
}
