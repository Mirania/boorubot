import * as dotenv from 'dotenv'; dotenv.config({ path: 'env.txt' });
import * as discord from 'discord.js';
import { connect, get } from './firebase-module';
import { checkGelbooru } from './booru/gelbooru';
import { checkDanbooru } from './booru/danbooru';
import { BooruConfig, minutes } from './utils';
import { ActivityType, GatewayIntentBits, Partials } from 'discord.js';

const bot = new discord.Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ], partials: [
        Partials.Message,
        Partials.Channel
    ]
})

bot.login(process.env.BOT_TOKEN);
connect(process.env.FIREBASE_CREDENTIALS, process.env.FIREBASE_URL);

bot.on("ready", async () => {
    bot.user.setActivity(`📚 ~ Reading booru ... ~`, { type: ActivityType.Custom });
    console.log("Bot is online.");

    const configs: BooruConfig = await get("booru/config");
    checkGelbooru(configs); setInterval(() => checkGelbooru(configs), minutes(15));
    //checkDanbooru(configs); setInterval(() => checkDanbooru(configs), minutes(15));
})

export function self(): discord.Client {
    return bot;
}
