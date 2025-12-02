declare global {
    interface Window {
        albumSize: number;
        accentColorVariant: string;
        mdThemeType: 'dark' | 'light';
        currentLyrics: any;
    }
    var loadedPlugins: any;
    var betterncm: any;
    var plugin: any;
    function dom(tag: string, props: any, ...children: any[]): HTMLElement;
}

export {};
