const worker = new Worker(new URL('./dbWorker.ts', import.meta.url), { type: 'module' });

let isReady = false;
let readyQueue: Function[] = [];

worker.onmessage = (e) => {
    if (e.data.type === 'READY') {
        isReady = true;
        readyQueue.forEach(cb => cb());
        readyQueue = [];
        return;
    }
    const { id, result, error } = e.data;
    if (callbacks.has(id)) {
        const { resolve, reject } = callbacks.get(id)!;
        callbacks.delete(id);
        if (error) reject(new Error(error));
        else resolve(result);
    }
};

let messageId = 0;
const callbacks = new Map<number, { resolve: Function, reject: Function }>();

const postMessageAsync = async (data: any): Promise<any> => {
    if (!isReady) {
        await new Promise<void>(r => readyQueue.push(r));
    }
    return new Promise((resolve, reject) => {
        const id = ++messageId;
        callbacks.set(id, { resolve, reject });
        worker.postMessage({ id, ...data });
    });
};

export const dbExec = async (sql: string, bind?: any[]): Promise<void> => {
    return postMessageAsync({ action: 'exec', sql, bind });
};

export const dbSelect = async <T = any>(sql: string, bind?: any[]): Promise<T[]> => {
    return postMessageAsync({ action: 'select', sql, bind });
};

export const dbSelectValue = async <T = any>(sql: string, bind?: any[]): Promise<T | null> => {
    return postMessageAsync({ action: 'selectValue', sql, bind });
};

export const dbExport = async (): Promise<Uint8Array> => {
    return postMessageAsync({ action: 'exportDb' });
};
