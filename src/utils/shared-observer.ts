
type MutationCallback = (mutations: MutationRecord[], observer: MutationObserver) => void;

interface ObserverEntry {
    options: MutationObserverInit;
    observer: MutationObserver;
    callbacks: Set<MutationCallback>;
}

const observers = new Map<Node, ObserverEntry[]>();

function areOptionsEqual(a: MutationObserverInit, b: MutationObserverInit): boolean {
    if (a === b) return true;
    const aKeys = Object.keys(a) as (keyof MutationObserverInit)[];
    const bKeys = Object.keys(b) as (keyof MutationObserverInit)[];

    if (aKeys.length !== bKeys.length) return false;

    for (const key of aKeys) {
        const valA = a[key];
        const valB = b[key];
        
        if (Array.isArray(valA) && Array.isArray(valB)) {
             if (valA.length !== valB.length) return false;
             // Simple shallow array comparison for attributeFilter
             for (let i = 0; i < valA.length; i++) {
                 if (valA[i] !== valB[i]) return false;
             }
        } else if (valA !== valB) {
            return false;
        }
    }
    return true;
}

export function observe(target: Node, options: MutationObserverInit, callback: MutationCallback) {
    let elementEntries = observers.get(target);
    if (!elementEntries) {
        elementEntries = [];
        observers.set(target, elementEntries);
    }

    let entry = elementEntries.find(e => areOptionsEqual(e.options, options));

    if (!entry) {
        const callbacks = new Set<MutationCallback>();
        const observer = new MutationObserver((mutations, obs) => {
            callbacks.forEach(cb => cb(mutations, obs));
        });
        observer.observe(target, options);
        entry = {
            options,
            observer,
            callbacks
        };
        elementEntries.push(entry);
    }

    entry.callbacks.add(callback);

    return () => {
        if (!entry) return;
        entry.callbacks.delete(callback);
        if (entry.callbacks.size === 0) {
            entry.observer.disconnect();
            if (elementEntries) {
                const index = elementEntries.indexOf(entry);
                if (index > -1) {
                    elementEntries.splice(index, 1);
                }
                if (elementEntries.length === 0) {
                    observers.delete(target);
                }
            }
        }
    };
}
