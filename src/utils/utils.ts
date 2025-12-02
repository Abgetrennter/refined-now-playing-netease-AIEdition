declare const betterncm: any;

export const waitForElement = (selector: string, fun: (element: Element) => void): void => {
	const selectors = selector.split(',');
	let done = true;
	for (const s of selectors) {
		if (!document.querySelector(s)) {
			done = false;
		}
	}
	if (done) {
		for (const s of selectors) {
			const el = document.querySelector(s);
			if (el) fun.call(this, el);
		}
		return;
	}
	let interval = setInterval(() => {
		let done = true;
		for (const s of selectors) {
			if (!document.querySelector(s)) {
				done = false;
			}
		}
		if (done) {
			clearInterval(interval);
			for (const s of selectors) {
				const el = document.querySelector(s);
				if (el) fun.call(this, el);
			}
		}
	}, 100);
}

export const waitForElementAsync = async (selector: string): Promise<Element | null> => {
	if (document.querySelector(selector)) {
		return document.querySelector(selector);
	}
	// Assuming betterncm is available in the global scope
	if (typeof betterncm !== 'undefined') {
		return await betterncm.utils.waitForElement(selector);
	}
	// Fallback or throw error if betterncm is not defined
	return new Promise((resolve) => {
		waitForElement(selector, (el) => resolve(el));
	});
}

export const getSetting = <T = string | boolean>(option: string, defaultValue: string | boolean = ''): T => {
	if (option.endsWith('-fm')) {
		option = option.replace(/-fm$/, '');
	}
	option = "refined-now-playing-" + option;
	let value: string | boolean | null = localStorage.getItem(option);
	if (value === null) {
		value = defaultValue;
	}
	if (value === 'true') {
		value = true;
	} else if (value === 'false') {
		value = false;
	}
	return value as T;
}

export const setSetting = (option: string, value: string | boolean | number): void => {
	option = "refined-now-playing-" + option;
	localStorage.setItem(option, String(value));
}

export const chunk = <T>(input: T[], size: number): T[][] => {
	return input.reduce((arr: T[][], item: T, idx: number) => {
		return idx % size === 0
			? [...arr, [item]]
			: [...arr.slice(0, -1), [...arr.slice(-1)[0], item]];
	}, []);
};

export const copyTextToClipboard = (text: string): void => {
	const textarea = document.createElement('textarea');
	textarea.style.position = 'fixed';
	textarea.style.top = '0';
	textarea.style.left = '0';
	textarea.style.opacity = '0';
	textarea.style.pointerEvents = 'none';
	textarea.value = text;
	document.body.appendChild(textarea);
	textarea.select();
	document.execCommand('copy', true);
	document.body.removeChild(textarea);
}

export const cyrb53 = (str: string, seed: number = 0): number => {
	let h1 = 0xdeadbeef ^ seed,
		h2 = 0x41c6ce57 ^ seed;
	for (let i = 0, ch; i < str.length; i++) {
		ch = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}

	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

	return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};
