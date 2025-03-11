import axios from "axios";
import { self } from "..";
import { get, post } from "../firebase-module";
import { BooruConfig, sendEmbed } from "../utils";
import { EmbedBuilder, GuildTextBasedChannel } from "discord.js";

const gelbooruApiLink = "https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&limit=10&tags={tag}";
const gelbooruPostLink = 'https://gelbooru.com/index.php?page=post&s=view&id={id}';

interface GelbooruImage {
    id: number,
    tags: string,
    rating: string,
    file_url: string
}

export async function checkGelbooru(config: BooruConfig) {
    const guild = self().guilds.cache.get(config.server);

    for (const repost of config.repost) {
        const lastSeenId = (await get<number>(`booru/gelbooru/lastSeenIds/${repost.tag}`)) || -1;
        const channel = guild.channels.cache.get(repost.channel) as GuildTextBasedChannel;
        console.log(`Checking gelbooru tag '${repost.tag}' for channel '${guild.name}' -> '#${channel.name}' (last seen: ${lastSeenId})`);

        const response = await fetchGelbooruFeed(repost.tag);

        for (let i = response.length - 1; i >= 0; i--) {
            if (response[i].id <= lastSeenId) continue;

            if (isAcceptableGelbooruImage(response[i], config)) {
                const embed = new EmbedBuilder()
                    .setColor(0xA67AC1)
                    .setTitle(`New '${repost.tag}' post | Gelbooru`)
                    .setURL(gelbooruPostLink.replace("{id}", response[i].id.toString()))
                    .setImage(response[i].file_url)
                    .setTimestamp()
                    .setFooter({ text: 'Click the title to see the full image' });

                console.log(`Posting gelbooru image ${response[i].id}.`);
                await sendEmbed(channel, embed);
            } else {
                console.log(`Skipping gelbooru image ${response[i].id} ...`);
            }

            if (i === 0) {
                await post(`booru/gelbooru/lastSeenIds/${repost.tag}`, response[i].id);
                console.log(`Last seen for gelbooru tag '${repost.tag}' is now ${response[i].id}.`);
            }
        }
    }
}

async function fetchGelbooruFeed(tag: string): Promise<GelbooruImage[]> {
    const url = gelbooruApiLink.replace("{tag}", tag.replaceAll(" ", "+"));

    try {
        return (await axios.get(url))?.data?.post ?? [];
    } catch (e) {
        console.log(`Failed to query ${url}`);
        console.error(e);
        return [];
    }
}

function isAcceptableGelbooruImage(image: GelbooruImage, config: BooruConfig) {
    const tags: string[] = (image.tags ?? '').split(' ');
    return (['sensitive', 'questionable', 'explicit'].includes(image.rating) && tags.every(tag => !config.bannedTags.includes(tag)));
}
