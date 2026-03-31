import { getMongoConfig } from './mongoConfig';

export class MongoClient {
    private collectionName: string;

    constructor(collectionName: string) {
        this.collectionName = collectionName;
    }

    private get config() {
        return getMongoConfig();
    }

    private async request(action: string, payload: any = {}) {
        const { apiUrl, apiKey, clusterName, dbName } = this.config;
        if (!apiUrl || !apiKey || !clusterName) {
            throw new Error("MongoDB Data API not properly configured");
        }

        const url = `${apiUrl}/action/${action}`;
        const body = JSON.stringify({
            dataSource: clusterName,
            database: dbName,
            collection: this.collectionName,
            ...payload
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey,
                'Accept': 'application/json'
            },
            body: body
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`MongoDB API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return await response.json();
    }

    async find(filter = {}, sort = {}, limit?: number) {
        const payload: any = { filter };
        if (Object.keys(sort).length > 0) payload.sort = sort;
        if (limit) payload.limit = limit;
        const result = await this.request('find', payload);
        return result.documents || [];
    }

    async findOne(filter = {}) {
        const result = await this.request('findOne', { filter });
        return result.document;
    }

    async insertOne(document: any) {
        return this.request('insertOne', { document });
    }
    
    async upsertOne(filter: any, updateSource: any) {
         return this.request('updateOne', {
             filter,
             update: { $set: updateSource },
             upsert: true
         });
    }

    async insertMany(documents: any[]) {
        return this.request('insertMany', { documents });
    }
    
    async deleteOne(filter: any) {
        return this.request('deleteOne', { filter });
    }

    async aggregate(pipeline: any[]) {
        const result = await this.request('aggregate', { pipeline });
        return result.documents || [];
    }
}
