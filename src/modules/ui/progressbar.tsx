import React from 'react';
import ReactDOM from 'react-dom';
import { ProgressbarPreview } from '../../components/progressbar-preview/progressbar-preview';
import { waitForElement } from '../../utils/dom';

export const initProgressbarPreview = () => {
    // Add progressbar hover preview
    // 添加进度条悬停预览
    waitForElement('#main-player .prg', (dom: HTMLElement) => {
        const progressbarPreview = document.createElement('div');
        progressbarPreview.classList.add('rnp-progressbar-preview');
        // @ts-ignore
        ReactDOM.render(<ProgressbarPreview dom={dom}/>, progressbarPreview);
        document.body.appendChild(progressbarPreview);
    });
    waitForElement('.m-player-fm .prg', (dom: HTMLElement) => {
        const progressbarPreview = document.createElement('div');
        progressbarPreview.classList.add('rnp-progressbar-preview');
        progressbarPreview.classList.add('rnp-progressbar-preview-fm');
        // @ts-ignore
        ReactDOM.render(<ProgressbarPreview dom={dom} isFM/>, progressbarPreview);
        document.body.appendChild(progressbarPreview);
    });
}
