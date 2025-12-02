import './refined-control-bar.scss';
import { waitForElement, getSetting, setSetting } from '../../utils/utils';

declare global {
    interface Window {
        rnpTimeIndicator: string;
        timeIndicator: string;
    }
}

const injectHTML = (type: string, html: string, parent: HTMLElement, fun: (dom: HTMLElement) => void = (dom) => {}) => {
	const dom = document.createElement(type);
	dom.innerHTML = html;
	fun.call(window, dom);

	parent.appendChild(dom);
	return dom;
}
const addPrefixZero = (num: number | string, len: number) => {
	let str = num.toString();
	while (str.length < len) {
		str = '0' + str;
	}
	return str;
}
const timeToSeconds = (time: string) => {
	let seconds = 0;
	const parts = time.split(':');
	for (let i = 0; i < parts.length; i++) {
		seconds += parseInt(parts[i]) * Math.pow(60, parts.length - i - 1);
	}
	return seconds;
}
const secondsToTime = (seconds: number) => {
	const m = Math.floor(seconds / 60);
	const s = Math.floor(seconds % 60);
	return `${m}:${addPrefixZero(s, 2)}`;
}
const updateTimeIndicator = () => {
	const passed = document.querySelector('#rnp-time-passed') as HTMLElement;
	const rest = document.querySelector('#rnp-time-rest') as HTMLElement;
    const nowTimeEl = document.querySelector('time.now') as HTMLElement;
    const allTimeEl = document.querySelector('time.all') as HTMLElement;

    if (!passed || !rest || !nowTimeEl || !allTimeEl) return;

	const passedTime = timeToSeconds(nowTimeEl.innerText);
	const totalTime = timeToSeconds(allTimeEl.innerText);
	const remainTime = totalTime - passedTime;

	passed.innerText = secondsToTime(passedTime);
	rest.innerText = window.rnpTimeIndicator == 'remain' ? '-' + secondsToTime(remainTime) : secondsToTime(totalTime);
}
const updateTimeIndicatorPosition = () => {
	const selectorList = ['.brt', '.speed', '.audioEffect', '.spk'];
	let leftestButton: HTMLElement | null = null;
	for (const selector of selectorList) {
		leftestButton = document.querySelector('.m-player ' + selector);
		if (!leftestButton) {
			continue;
		}
		if (leftestButton.childElementCount != 0) {
			break;
		}
	}
    
    if (!leftestButton) return;

	const right = parseInt(window.getComputedStyle(leftestButton).right) + leftestButton.clientWidth + 15;
    const timeIndicator = document.querySelector('#rnp-time-indicator') as HTMLElement;
    if (timeIndicator) {
	    timeIndicator.style.right = right + 'px';
    }
}

const init = () => {
	if (document.body.classList.contains('material-you-theme') || ~~loadedPlugins.MaterialYouTheme || ~~loadedPlugins['ark-theme']) {
		return;
	}

	window.timeIndicator = getSetting('time-indicator', 'remain') as string;
	waitForElement('#main-player', (dom: HTMLElement) => {
		injectHTML('div', `
			<span id="rnp-time-passed">0:00</span>
			/
			<span id="rnp-time-rest">0:00</span>
		`, dom, (dom) => {
			dom.id = 'rnp-time-indicator';
			dom.style.cssText = 'opacity: 0; pointer-events: none;';
		});
        const timeRest = document.querySelector('#rnp-time-rest');
        if (timeRest) {
            timeRest.addEventListener('click', () => {
                if ((window.rnpTimeIndicator ?? 'remain') == 'remain') {
                    window.rnpTimeIndicator = 'total';
                } else {
                    window.rnpTimeIndicator = 'remain';
                }
                setSetting('time-indicator', window.rnpTimeIndicator);
                updateTimeIndicator();
                updateTimeIndicatorPosition();
            });
        }

		const timeNow = document.querySelector('time.now');
        if (timeNow) {
            new MutationObserver(() => {
                updateTimeIndicator();
            }).observe(timeNow, { childList: true });
        }
        
        const brt = document.querySelector('#main-player .brt');
        if (brt) {
            new MutationObserver(() => {
                updateTimeIndicatorPosition();
            }).observe(brt, { childList: true });
        }
		
        const speed = document.querySelector('#main-player .speed');
        if (speed) {
            new MutationObserver(() => {
                updateTimeIndicatorPosition();
            }).observe(speed, { childList: true });
        }
	});
};

init();
