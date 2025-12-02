import { getSetting, setSetting } from './storage';

export const addOrRemoveGlobalClassByOption = (className: string, optionValue: boolean) => {
    if (optionValue) {
        document.body.classList.add(className);
    } else {
        document.body.classList.remove(className);
    }
}

const sliderEnhance = (slider: HTMLInputElement) => {
    const isMidSlider = slider.classList.contains("mid-slider");
    slider.addEventListener("input", (e: any) => {
        const value = e.target.value;
        const min = e.target.min;
        const max = e.target.max;
        const percent = (value - min) / (max - min);
        let bg = `linear-gradient(90deg, var(--rnp-accent-color) ${percent * 100}%, #dfe1e422 ${percent * 100}%)`;
        if (!isMidSlider) e.target.style.background = bg;

        if (value !== e.target.getAttribute("default")) {
            e.target.parentElement?.classList.add("changed");
        } else {
            e.target.parentElement?.classList.remove("changed");
        }
    });
    if (slider.parentElement?.querySelector(".rnp-slider-reset")) {
        slider.parentElement.querySelector(".rnp-slider-reset")?.addEventListener("click", (e: any) => {
            const slider = e.target.parentElement.parentElement.querySelector(".rnp-slider");
            slider.value = slider.getAttribute("default");
            slider.dispatchEvent(new Event("input"));
            slider.dispatchEvent(new Event("change"));
        });
    }
    slider.dispatchEvent(new Event("input"));
}

export const bindCheckboxToClass = (checkbox: HTMLInputElement, className: string, defaultValue: boolean = false, callback: (checked: boolean) => void = () => {}, isFM: boolean, reloadFlag: boolean[]) => {
    checkbox.checked = getSetting(checkbox.id, defaultValue);
    checkbox.addEventListener("change", (e: any) => {
        reloadFlag[isFM ? 1 : 0] = true;
        setSetting(checkbox.id, e.target.checked);
        addOrRemoveGlobalClassByOption(className, e.target.checked);
        callback(e.target.checked);
    });
    addOrRemoveGlobalClassByOption(className, checkbox.checked);
    callback(checkbox.checked);
}

export const bindCheckboxToFunction = (checkbox: HTMLInputElement, func: (checked: boolean) => void, defaultValue: boolean = false, isFM: boolean, reloadFlag: boolean[]) => {
    checkbox.checked = getSetting(checkbox.id, defaultValue);
    checkbox.addEventListener("change", (e: any) => {
        reloadFlag[isFM ? 1 : 0] = true;
        setSetting(checkbox.id, e.target.checked);
        func(e.target.checked);
    });
    func(checkbox.checked);
}

export const bindSliderToCSSVariable = (slider: HTMLInputElement, variable: string, defaultValue: number = 0, event: string = 'input', mapping: (val: any) => any = (x) => { return x }, addClassWhenAdjusting: string = '', isFM: boolean, reloadFlag: boolean[]) => {
    slider.value = getSetting(slider.id, defaultValue);
    slider.dispatchEvent(new Event("input"));
    slider.addEventListener(event, (e: any) => {
        const value = e.target.value;
        document.body.style.setProperty(variable, mapping(value));
    });
    slider.addEventListener("change", (e: any) => {
        reloadFlag[isFM ? 1 : 0] = true;
        setSetting(slider.id, e.target.value);
    });
    if (addClassWhenAdjusting) {
        slider.addEventListener("mousedown", e => {
            document.body.classList.add(addClassWhenAdjusting);
        });
        slider.addEventListener("mouseup", e => {
            document.body.classList.remove(addClassWhenAdjusting);
        });
    }
    document.body.style.setProperty(variable, mapping(slider.value));
    sliderEnhance(slider);
}

export const bindSliderToFunction = (slider: HTMLInputElement, func: (val: any) => void, defaultValue: number = 0, event: string = 'input', mapping: (val: any) => any = (x) => { return x }, addClassWhenAdjusting: string = '', isFM: boolean, reloadFlag: boolean[]) => {
    slider.value = getSetting(slider.id, defaultValue);
    slider.dispatchEvent(new Event("input"));
    slider.addEventListener(event, (e: any) => {
        const value = e.target.value;
        func(mapping(value));
    });
    slider.addEventListener("change", (e: any) => {
        reloadFlag[isFM ? 1 : 0] = true;
        setSetting(slider.id, e.target.value);
    });
    if (addClassWhenAdjusting) {
        slider.addEventListener("mousedown", e => {
            document.body.classList.add(addClassWhenAdjusting);
        });
        slider.addEventListener("mouseup", e => {
            document.body.classList.remove(addClassWhenAdjusting);
        });
    }
    func(mapping(slider.value));
    sliderEnhance(slider);
}

export const bindSelectGroupToClasses = (selectGroup: HTMLElement, defaultValue: string, mapping: (val: string) => string = (x) => { return x }, callback: (val: string) => void = (x) => {}, isFM: boolean, reloadFlag: boolean[]) => {
    const buttons = selectGroup.querySelectorAll(".rnp-select-group-btn");
    buttons.forEach(button => {
        button.addEventListener("click", (e: any) => {
            const value = e.target.getAttribute("value");
            buttons.forEach(button => {
                button.classList.remove("selected");
                document.body.classList.remove(mapping(button.getAttribute("value")!));
            });
            e.target.classList.add("selected");
            document.body.classList.add(mapping(value));
            reloadFlag[isFM ? 1 : 0] = true;
            setSetting(selectGroup.id, value);
            callback(value);
        });
    });
    const value = getSetting<string>(selectGroup.id, defaultValue);
    buttons.forEach(button => {
        if (button.getAttribute("value") === value) {
            button.classList.add("selected");
            document.body.classList.add(mapping(value));
        } else {
            button.classList.remove("selected");
            document.body.classList.remove(mapping(button.getAttribute("value")!));
        }
    });
    callback(value);
}

export const initTabs = (menu: HTMLElement) => {
    const tabs = menu.querySelectorAll('.rnp-settings-menu-tabs .rnp-settings-menu-tab');
    const container = menu.querySelector('.rnp-settings-menu-inner') as HTMLElement;
    const sections = container.querySelectorAll('.rnp-group') as NodeListOf<HTMLElement>;
    let active = (container.querySelector('.rnp-group.active') as HTMLElement)?.dataset?.tab ?? 'appearance';
    const setActive = (name: string) => {
        if (name === active) return;
        active = name;
        tabs.forEach((x) => {
            if ((x as HTMLElement).dataset.tab === name) x.classList.add('active');
            else x.classList.remove('active');
        });			
    };
    tabs.forEach((x) => {
        x.addEventListener('click', () => {
            const tab = (x as HTMLElement).dataset.tab;
            const target = container.querySelector(`.rnp-group[data-tab="${tab}"]`) as HTMLElement;
            if (target) {
                const top = target.offsetTop + 5;
                container.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
    container.addEventListener('scroll', () => {
        const top = container.scrollTop;
        if (top + container.clientHeight >= container.scrollHeight) {
            setActive(sections[sections.length - 1].dataset.tab!);
            return;
        }
        let name = active;
        sections.forEach((x) => {
            if (x.offsetTop <= top) name = x.dataset.tab!;
        });
        setActive(name);
    });
    menu.querySelector('input.rnp-settings')?.addEventListener('click', () => {
        container.dispatchEvent(new Event('scroll'));
    });
};
