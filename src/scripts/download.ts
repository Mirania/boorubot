/**
 * scrapes and downloads everything for given tag(s).
 * usage example: node built/scripts/download.js "mytag" "my_other_tag" "and_more"
 */

import axios from "axios";
var exec = require('child_process').exec;

const gelbooruApiLink = "https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&limit=20&pid={page}&tags={tag}";
// horrible practice i know. i dont really care if this gets leaked or stolen.
const gelbooruApiAuth = "&a" + "pi" + "_key=cf18b9e80b49eacb093dffdb2ee868" + "7d5ae8a5c746f88a7d1eaf31a475d4a086" + "&user" + "_id=1343170";

async function download(tags: string[]) {
    let page = 0;

    let imageLinks: string[] = [];
    do {
        const url = gelbooruApiLink.replace("{page}", page.toString()).replace("{tag}", tags.join("+")) + gelbooruApiAuth;
        imageLinks = (await axios.get(url))?.data?.post?.map(p => p.file_url);
        await Promise.all(imageLinks.map(link => downloadImage(link)));

        page++;
        console.log("Page", page, "checked, saw", imageLinks.length, "results.");
        await sleep(5000);
    } while (imageLinks.length >= 20);

}

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadImage(url: string) {
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

console.log("Downloading for tag search:", process.argv.slice(2));
download(process.argv.slice(2));
