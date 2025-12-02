export const initGlobalHandlers = () => {
    // 全局错误处理
    // Global Error Handler
    window.addEventListener('error', (event) => {
        console.error('Refined Now Playing: Uncaught Error:', event.error || event.message);
    });

    window.addEventListener('unhandledrejection', (event) => {
        console.error('Refined Now Playing: Unhandled Promise Rejection:', event.reason);
    });

    console.log('Refined Now Playing: Initializing...');
}

declare global {
    interface Window {
        albumSize: number;
        accentColorVariant: string;
        mdThemeType: 'dark' | 'light';
    }
}
