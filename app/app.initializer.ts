import mongoose from 'mongoose';

interface IEnv {
    PORT: number;
    MONGO: string;
}

const MONGO_OPTIONS = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    socketTimeoutMS: 30000,
    keepAlive: true,
    autoIndex: false,
    retryWrites: false,
}

export class AppInitializer {
    private readonly env: IEnv;
    constructor(env: unknown) {
        this.env = env as IEnv;
    }

    public async init(): Promise<void> {
        try {
            await mongoose.connect(this.env.MONGO, MONGO_OPTIONS);
            this.log('MongoDb connected');
        } catch (error) {
            this.log(`ERROR: MongoDB not connected ${error}`);
        }
    } 

    private log(message: string): void {
        console.log(`[APP INIT]: ${message}`);
    }
}
