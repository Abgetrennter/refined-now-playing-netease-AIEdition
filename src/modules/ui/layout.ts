let lastTitle = "";
const titleSizeController = document.createElement('style');
titleSizeController.innerHTML = '';
document.head.appendChild(titleSizeController);

const verticalAlignMiddleController = document.createElement('style');
verticalAlignMiddleController.innerHTML = '';
document.head.appendChild(verticalAlignMiddleController);

/**
 * 重新计算标题字体大小以适应容器
 * Recalculate title font size to fit container
 * @param {boolean} forceRefresh - 是否强制刷新 / Force refresh
 */
export const recalculateTitleSize = (forceRefresh: boolean = false) => {
    const title = document.querySelector('.g-single .g-singlec-ct .n-single .mn .head .inf .title') as HTMLElement;
    if (!title) {
        return;
    }
    if (title.innerText === lastTitle && !forceRefresh) {
        return;
    }
    lastTitle = title.innerText;
    const text = title.innerText;
    const testDiv = document.createElement('div');
    testDiv.style.position = 'absolute';
    testDiv.style.top = '-9999px';
    testDiv.style.left = '-9999px';
    testDiv.style.width = 'auto';
    testDiv.style.height = 'auto';
    testDiv.style.whiteSpace = 'nowrap';
    testDiv.innerText = text;
    document.body.appendChild(testDiv);

    const maxThreshold = Math.max(Math.min(document.body.clientHeight * 0.05, 60), 45);
    const minThreshold = 24;
    const targetWidth = document.querySelector('.g-single-track .g-singlec-ct .n-single .mn .head .inf .title')?.clientWidth || 0;

    if (targetWidth == 0) {
        return;
    }

    let l = 1; 
    let r = 61;
    while (l < r) {
        const mid = Math.floor((l + r) / 2);
        testDiv.style.fontSize = `${mid}px`;
        const width = testDiv.clientWidth;
        if (width > targetWidth) {
            r = mid;
        } else {
            l = mid + 1;
        }
    }
    let fontSize = l - 1;
    while (testDiv.clientWidth > targetWidth) {
        fontSize--;
        testDiv.style.fontSize = `${fontSize}px`;
    }
    fontSize = Math.max(Math.min(fontSize, maxThreshold), minThreshold);
    testDiv.style.fontSize = `${fontSize}px`;
    const width = testDiv.clientWidth;
    document.body.removeChild(testDiv);
    titleSizeController.innerHTML = `
        .g-single .g-singlec-ct .n-single .mn .head .inf .title h1 {
            font-size: ${fontSize}px !important;
        }
    `;
}

/**
 * 移动歌曲标签到标题旁边
 * Move song tags next to the title
 */
export const moveTags = () => {
    const titleBase = document.querySelector(".g-single-track .g-singlec-ct .n-single .mn .head .inf .title");
    if (!titleBase) {
        return;
    }
    const tags = titleBase.querySelector("h1 > .name > .tag-wrap");
    if (!tags) {
        return;
    }
    const existingTags = titleBase.querySelector("h1 > .tag-wrap");
    if (existingTags) {
        existingTags.remove();
    }
    titleBase.querySelector("h1")?.appendChild(tags);
}

export const calcTitleScroll = () => {
    moveTags();
    const titleContainer = document.querySelector('.g-single .g-singlec-ct .n-single .mn .head .inf .title .name');
    if (!titleContainer) {
        return;
    }
    if ((titleContainer?.firstChild?.nodeType ?? 0 ) === 3) {
        const titleInner = document.createElement('div');
        titleInner.classList.add('name-inner');
        titleInner.innerHTML = titleContainer.innerHTML.replace(/&nbsp;/g, ' ');
        titleContainer.innerHTML = '';
        titleContainer.appendChild(titleInner);
    }
}

export const initLayoutListeners = () => {
    window.addEventListener('resize', () => {
        recalculateTitleSize(true);
    });

    new MutationObserver(() => {
        recalculateTitleSize();
        calcTitleScroll();
    }).observe(document.body, { childList: true , subtree: true, attributes: true, characterData: true, attributeFilter: ['src']});
}
