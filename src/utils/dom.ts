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
	navigator.clipboard.writeText(text);
	document.body.removeChild(textarea);
}
