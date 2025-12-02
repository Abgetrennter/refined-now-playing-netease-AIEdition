export type MountPoint = 'background' | 'coverShadow' | 'lyrics' | 'miniSongInfo' | 'fmLyrics' | 'fmBackground';

type Listener = () => void;

interface MountData {
    container: HTMLElement;
    data?: any;
}

class MountStore {
    private mounts: Record<string, MountData | null> = {};
    private listeners: Set<Listener> = new Set();

    get(key: MountPoint): MountData | null {
        return this.mounts[key] || null;
    }

    set(key: MountPoint, container: HTMLElement, data?: any) {
        // Check if same container and same data (shallow check)
        const current = this.mounts[key];
        if (current && current.container === container && current.data === data) return;
        
        this.mounts[key] = { container, data };
        this.notify();
    }

    subscribe(listener: Listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notify() {
        this.listeners.forEach(l => l());
    }
}

export const mountStore = new MountStore();
