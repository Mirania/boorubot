import * as discord from 'discord.js';
var exec = require('child_process').exec;

export type BooruConfig = {
    server: discord.Snowflake,
    repost: BooruConfigRepost[],
    bannedTags: string[]
};

export type BooruConfigRepost = {
    tag: string, 
    channel: discord.Snowflake
};

export type Secrets = {
    readonly BOT_TOKEN: string;
};

export async function sendMessage(channel: discord.GuildTextBasedChannel, message: string) {
    return channel.send({ content: message }).catch((reason: string) => {
        const errorMessage = `Failed to send text message: ${reason}`;
        console.error(errorMessage);
        return Promise.reject(errorMessage);
    });
}

export async function sendEmbed(channel: discord.GuildTextBasedChannel, embed: discord.EmbedBuilder, file?: discord.AttachmentBuilder) {
    return channel.send({ embeds: [embed], files: file ? [file] : undefined }).catch((reason: string) => {
        const errorMessage = `Failed to send embed message: ${reason}`;
        console.error(errorMessage);
        return Promise.reject(errorMessage);
    });
}

/**
 * Returns an amount of minutes in ms.
 */
export function minutes(amount: number): number {
    return amount * 60 * 1000;
}

/**
 * Returns an amount of seconds in ms.
 */
export function seconds(amount: number): number {
    return amount * 1000;
}

/**
 * Gets the current time in HH:mm.
 */
export function currentTimeFormatted(): string {
    const now = new Date();
    const hours = now.getHours() < 10 ? `0${now.getHours()}` : now.getHours();
    const minutes = now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes();
    return `${hours}:${minutes}`;
}

export async function downloadImage(url: string) {
    return new Promise((resolve, reject) => {
        exec(`curl -H "Referer: https://gelbooru.com" -O ${url}`, function (error, stdout, stderr) {
            if (error != null) {
                console.error('exec error: ' + error);
                console.error(stderr);
                reject(error);
            } else {
                resolve(stdout);
            }
        });
    });
}
