export interface MongoConfig {
    enabled: boolean;
    apiUrl: string;
    apiKey: string;
    clusterName: string;
    dbName: string;
}

const STORAGE_KEY = 'gymtracker_mongo_config';

export const getMongoConfig = (): MongoConfig => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error('Failed to parse mongo config', e);
        }
    }
    return {
        enabled: false,
        apiUrl: '',
        apiKey: '',
        clusterName: '',
        dbName: 'gymtracker'
    };
};

export const saveMongoConfig = (config: MongoConfig) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};
