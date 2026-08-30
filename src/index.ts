import * as dotenv from 'dotenv'; dotenv.config({ path: 'env.txt' });
import * as discord from 'discord.js';
import { connect, get } from './firebase-module';
import * as rot from './rotcrypt';
import { checkGelbooru } from './booru/gelbooru';
import { checkDanbooru } from './booru/danbooru';
import { BooruConfig, minutes, Secrets } from './utils';
import { ActivityType, GatewayIntentBits, Partials } from 'discord.js';

if (process.argv[2] !== "fromSh") {
    console.log("Make sure to run this bot using 'bash runner.sh' instead.");
    process.exit(123);
}

const bot = new discord.Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ], partials: [
        Partials.Message,
        Partials.Channel
    ]
});

main();

async function main() {
    connect(process.env.FIREBASE_CREDENTIALS, process.env.FIREBASE_URL);
    const rawSecrets: any = await get("env/boorubot");
    const secrets: Secrets = {
        BOT_TOKEN: rot.decrypt(rawSecrets.BOT_TOKEN, rawSecrets.ROT)
    };

    bot.login(secrets.BOT_TOKEN);

    bot.on("ready", async () => {
        bot.user.setActivity(`📚 ~ Reading booru ... ~`, { type: ActivityType.Custom });
        console.log("Bot is online.");

        const configs: BooruConfig = await get(process.env.DEBUG === "true" ? "booru/testconfig" : "booru/config");
        checkGelbooru(configs); setInterval(() => checkGelbooru(configs), minutes(15));
        //checkDanbooru(configs); setInterval(() => checkDanbooru(configs), minutes(15));
    });
}

export function self(): discord.Client {
    return bot;
}
