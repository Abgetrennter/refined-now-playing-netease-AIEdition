declare const loadedPlugins: any;
declare const betterncm: any;

/**
 * 切换全屏模式
 * Toggle full screen mode
 * @param {boolean|null} force - 强制开启(true)或关闭(false)，null为切换 / Force enable(true) or disable(false), null to toggle
 */
export const toggleFullScreen = (force: boolean | null = null) => {
    if (!document.fullscreenElement) {
        if (force === false) return;
        document.documentElement.requestFullscreen();
        if (loadedPlugins['RoundCornerNCM']) {
            betterncm.app.setRoundedCorner(false);
        }
        document.body.classList.add('rnp-full-screen');
        const btn = document.querySelector('.rnp-full-screen-button') as HTMLElement;
        if (btn) btn.title = '退出全屏';
        
    } else {
        if (document.exitFullscreen) {
            if (force === true) return;
            document.exitFullscreen();
            if (loadedPlugins['RoundCornerNCM']) {
                betterncm.app.setRoundedCorner(true);
            }
            document.body.classList.remove('rnp-full-screen');
            const btn = document.querySelector('.rnp-full-screen-button') as HTMLElement;
            if (btn) btn.title = '全屏';
        }
    }
}

/**
 * 添加全屏按钮和时钟
 * Add full screen button and clock
 */
export const addFullScreenButton = (container: Element | null) => {
    if (!container) return;
    const fullScreenButton = document.createElement('div');
    fullScreenButton.classList.add('rnp-full-screen-button');
    fullScreenButton.title = '全屏';
    fullScreenButton.addEventListener('click', () => {toggleFullScreen()});
    document.body.appendChild(fullScreenButton); 
    //Full Screen Clock
    var fullScreenClock = document.createElement('div');
    fullScreenClock.classList.add('rnp-full-screen-clock');
    function updateClock() {
        var currentTime = new Date();
        var hours: string | number = currentTime.getHours();
        var minutes: string | number = currentTime.getMinutes();
      
        // 格式化小时和分钟，确保是两位数
        hours = ('0' + hours).slice(-2);
        minutes = ('0' + minutes).slice(-2);
        fullScreenClock.textContent = hours + ':' + minutes;
      }
    updateClock();
    setInterval(updateClock, 1000);
    document.body.appendChild(fullScreenClock);
};

export const initFullScreenListener = () => {
    new MutationObserver(() => {
        if (!document.body.classList.contains('mq-playing') && document.body.classList.contains('rnp-full-screen')) {
            toggleFullScreen(false);
        }
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
}
