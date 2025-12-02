export const getSetting = <T = string | boolean | number>(option: string, defaultValue: string | boolean | number = ''): T => {
	if (option.endsWith('-fm')) {
		option = option.replace(/-fm$/, '');
	}
	option = "refined-now-playing-" + option;
	let value: string | boolean | number | null = localStorage.getItem(option);
	if (value === null) {
		value = defaultValue;
	}
	if (value === 'true') {
		value = true;
	} else if (value === 'false') {
		value = false;
	} else if (!isNaN(Number(value)) && value !== '') {
        // Try to parse as number if defaultValue is number
        if (typeof defaultValue === 'number') {
             value = Number(value);
        }
    }
	return value as T;
}

export const setSetting = (option: string, value: string | boolean | number): void => {
	option = "refined-now-playing-" + option;
	localStorage.setItem(option, String(value));
}
