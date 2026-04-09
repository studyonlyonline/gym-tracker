export interface JsonConfig {
    enabled: boolean;
}

const STORAGE_KEY = 'gymtracker_json_config';

export const getJsonConfig = (): JsonConfig => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error('Failed to parse json config', e);
        }
    }
    return {
        enabled: false
    };
};

export const saveJsonConfig = (config: JsonConfig) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};
