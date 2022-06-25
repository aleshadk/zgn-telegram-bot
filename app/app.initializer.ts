import mongoose from 'mongoose';
import { appEnvironment } from './app.environment';
import { TelegramBot } from './Telegram/Temp';

async function initMongo(): Promise<void> {
    const MONGO_OPTIONS = {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        socketTimeoutMS: 30000,
        keepAlive: true,
        autoIndex: false,
        retryWrites: false,
    }

    try {
        await mongoose.connect(appEnvironment.mongoConnectionString, MONGO_OPTIONS);
        console.log('[APP INIT]: MongoDb connected');
    } catch (error) {
        console.log(`[APP INIT]: ERROR: MongoDB not connected ${error}`);
    }
}

export async function initApp(): Promise<void> {
    await initMongo();
    console.log('App started');
}
