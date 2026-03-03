import * as discord from 'discord.js';

export type BooruConfig = {
    server: discord.Snowflake,
    repost: BooruConfigRepost[],
    bannedTags: string[]
};

export type BooruConfigRepost = {
    tag: string, 
    channel: discord.Snowflake
};

export async function sendMessage(channel: discord.GuildTextBasedChannel, message: string) {
    return channel.send({ content: message }).catch((reason: string) => {
        const errorMessage = `Failed to send text message: ${reason}`;
        console.error(errorMessage);
        return Promise.reject(errorMessage);
    });
}

export async function sendEmbed(channel: discord.GuildTextBasedChannel, embed: discord.EmbedBuilder) {
    return channel.send({ embeds: [embed] }).catch((reason: string) => {
        const errorMessage = `Failed to send embed message: ${reason}`;
        console.error(errorMessage);
        return Promise.reject(errorMessage);
    });
}

/**
 * Check if message was posted by the bot owner.
 */
export function isOwner(message: discord.Message): boolean {
    return process.env.OWNER_ID === message.author.id;
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
