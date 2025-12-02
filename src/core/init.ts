import { compatibilityWizard } from '../components/compatibility/compatibility-check';
import { initGlobalHandlers } from './global';
import { initImageSrcInterceptor } from './interceptors';
import { initSystemThemeListener } from '../modules/theme/watcher';
import { initIdleDetection } from '../modules/ui/idle';
import { initProgressbarPreview } from '../modules/ui/progressbar';
import { initLayoutListeners } from '../modules/ui/layout';
import { initFullScreenListener } from '../modules/ui/fullscreen';
import { patchNowPlaying, patchFM, initThemeFix } from '../modules/ui/patcher';
import { waitForElement } from '../utils/dom';

declare const plugin: any;
declare const dom: any;
declare const loadedPlugins: any;

export const init = () => {
    initGlobalHandlers();
    initImageSrcInterceptor();
    initLayoutListeners();
    initFullScreenListener();

    plugin.onLoad(async (p: any) => {
        compatibilityWizard();

        document.body.classList.add('refined-now-playing');

        if (!loadedPlugins['MaterialYouTheme']) {
            document.body.classList.add('no-material-you-theme');
        }

        waitForElement("#main-player, .m-pinfo", (dom: HTMLElement) => {
            dom.addEventListener('mouseenter', () => {
                document.body.classList.add('bottombar-hover');
            });
            dom.addEventListener('mouseleave', () => {
                document.body.classList.remove('bottombar-hover');
            });
        });

        patchNowPlaying();
        patchFM();
        initThemeFix();
        
        initSystemThemeListener();
        initIdleDetection();
        initProgressbarPreview();
    });

    plugin.onConfig((tools: any) => {
        return dom("div", {},
            dom("span", { innerHTML: "打开正在播放界面以调整设置 " , style: { fontSize: "18px" } }),
            tools.makeBtn("打开", async () => {
                (document.querySelector("a[data-action='max']") as HTMLElement)?.click();
            }),
            dom("div", { innerHTML: "" , style: { height: "20px" } }),
            dom("span", { innerHTML: "进入兼容性检查页面 " , style: { fontSize: "18px" } }),
            tools.makeBtn("兼容性检查", async () => {
                compatibilityWizard(true);
            })
        );
    });
}
