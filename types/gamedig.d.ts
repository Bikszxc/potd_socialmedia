declare module 'gamedig' {
    export interface QueryOptions {
        type: string;
        host: string;
        port?: number;
        maxAttempts?: number;
        socketTimeout?: number;
        [key: string]: any;
    }

    export interface QueryResult {
        name: string;
        map: string;
        password: boolean;
        numplayers: number;
        maxplayers: number;
        players: any[];
        bots: any[];
        connect: string;
        ping: number;
        raw: any;
    }

    export class GameDig {
        static query(options: QueryOptions): Promise<QueryResult>;
    }
}
