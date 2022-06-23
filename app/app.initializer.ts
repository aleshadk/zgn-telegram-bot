import mongoose from 'mongoose';
import { TelegramBot } from './Telegram/Temp';

interface IEnv {
    PORT: number;
    MONGO: string;
    TELEGRAM_BOT_TOKEN: string;
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
        await Promise.all([
            this.initMongo(),
            this.initTelegram()
        ]);
    } 

    private async initMongo(): Promise<void> {
        try {
            await mongoose.connect(this.env.MONGO, MONGO_OPTIONS);
            this.log('MongoDb connected');
        } catch (error) {
            this.log(`ERROR: MongoDB not connected ${error}`);
        }
    } 

    private async initTelegram(): Promise<void> {
        new TelegramBot(this.env.TELEGRAM_BOT_TOKEN);
        this.log('TelegramBot connected');

    } 

    private log(message: string): void {
        console.log(`[APP INIT]: ${message}`);
    }
}
