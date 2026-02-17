import axios from "axios";
import { self } from "..";
import { get, post } from "../firebase-module";
import { BooruConfig, sendEmbed } from "../utils";
import { EmbedBuilder, GuildTextBasedChannel } from "discord.js";

const danbooruApiLink = "https://danbooru.donmai.us/posts.json?tags={tag}&limit=10";
const danbooruPostLink = 'https://danbooru.donmai.us/posts/{id}';

interface DanbooruImage {
    id: number,
    tag_string: string,
    rating: string,
    file_url: string
}

export async function checkDanbooru(config: BooruConfig) {
    const guild = self().guilds.cache.get(config.server);

    for (const repost of config.repost) {
        const lastSeenId = (await get<number>(`booru/danbooru/lastSeenIds/${repost.tag}`)) || -1;
        const channel = guild.channels.cache.get(repost.channel) as GuildTextBasedChannel;
        console.log(`Checking danbooru tag '${repost.tag}' for channel '${guild.name}' -> '#${channel.name}' (last seen: ${lastSeenId})`);

        const response = await fetchDanbooruFeed(repost.tag);

        for (let i = response.length - 1; i >= 0; i--) {
            if (response[i].id <= lastSeenId) continue;

            if (isAcceptableDanbooruImage(response[i], config)) {
                const embed = new EmbedBuilder()
                    .setColor(0xA67AC1)
                    .setTitle(`New '${repost.tag}' post | Danbooru`)
                    .setURL(danbooruPostLink.replace("{id}", response[i].id.toString()))
                    .setImage(response[i].file_url)
                    .setTimestamp()
                    .setFooter({ text: 'Click the title to see the full image' });

                console.log(`Posting danbooru image ${response[i].id}.`);
                await sendEmbed(channel, embed);
            } else {
                console.log(`Skipping danbooru image ${response[i].id} ...`);
            }

            if (i === 0) {
                await post(`booru/danbooru/lastSeenIds/${repost.tag}`, response[i].id);
                console.log(`Last seen for danbooru tag '${repost.tag}' is now ${response[i].id}.`);
            }
        }
    }
}

async function fetchDanbooruFeed(tag: string): Promise<DanbooruImage[]> {
    const url = danbooruApiLink.replace("{tag}", tag.replaceAll(" ", "+"));

    try {
        return (await axios.get(url))?.data ?? [];
    } catch (e) {
        console.log(`Failed to query ${url}`);
        console.error(e);
        return [];
    }
}

function isAcceptableDanbooruImage(image: DanbooruImage, config: BooruConfig) {
    const tags: string[] = (image.tag_string ?? '').split(' ');
    return (['s', 'q', 'e'].includes(image.rating) && tags.every(tag => !(config.bannedTags ?? []).includes(tag)));
}
