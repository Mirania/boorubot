import * as discord from 'discord.js';

export type BooruConfig = {
    server: discord.Snowflake,
    repost: { tag: string, channel: discord.Snowflake }[],
    bannedTags: string[]
};

export async function sendEmbed(channel: discord.GuildTextBasedChannel, embed: discord.EmbedBuilder) {
    try {
        await channel.send({ embeds: [embed] });
    } catch (e) {
        console.log(`Failed to send embed message`);
        console.error(e);
    }
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