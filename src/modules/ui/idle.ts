export const initIdleDetection = () => {
    const IdleThreshold = 1.5 * 1000;
    let idleTimer: any = null;
    let idle = false;
    let debounceTime: number | null = null;
    let debounceTimer: any = null;
    const resetIdleTimer = () => {
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            idle = true;
            document.body.classList.add('rnp-idle');
            if (debounceTimer) clearTimeout(debounceTimer);
        }, IdleThreshold);
    }
    const resetIdle = () => {
        if (idle) {
            idle = false;
            document.body.classList.remove('rnp-idle');
            debounceTime = new Date().getTime();
        }
        resetIdleTimer();
    }
    const setIdle = () => {
        debounceTimer = setTimeout(() => {
            if (idleTimer) clearTimeout(idleTimer);
            idle = true;
            document.body.classList.add('rnp-idle');
        }, Math.max((debounceTime ?? 0) + 325 - new Date().getTime(), 0));
    }
    resetIdleTimer();
    document.addEventListener('mousemove', resetIdle);
    document.addEventListener('mouseout', (e) => {
        if (e.relatedTarget === null) {
            setIdle();
        }
    });
}
