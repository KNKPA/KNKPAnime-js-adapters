const parser = require('node-html-parser');
const parse = parser.parse;

export async function search(keyword) {
    const resp = await fetch(`https://www.nyafun.net/search.html?wd=${keyword}`);
    const html = await resp.text();
    const doc = parse(html);

    const divs = doc.querySelectorAll('.public-list-box');
    const ret = divs.map(div => {
        const a = div.querySelector('.thumb-txt.cor4.hide').querySelector('a');
        const seriesId = a.attributes.href;
        const name = a.text;
        const description = div.querySelector('.cor5.thumb-blurb.hide2').text;
        const image = div.querySelector('img').attributes['data-src'];
        return {
            seriesId,
            name,
            description,
            image,
        };
    });
    return JSON.stringify(ret);
}

export async function getSources(seriesId) {
    console.log('enter getSources');
    const resp = await fetch(`https://www.nyafun.net${seriesId}`);
    console.log('after fetching details');
    const doc = parse(await resp.text());
    console.log('after parse');
    const ul = doc.querySelector('.anthology-list-play');
    const episodes = ul.querySelectorAll('li').map((li, idx) => {
        const a = li.querySelector('a');
        return {
            episodeId: a.attributes.href,
            episode: idx,
            episodeName: a.text,
        };
    })
    return JSON.stringify([{
        episodes,
    }])
}

export async function getVideoResource(episodeId) {
    return `https://www.nyafun.net${episodeId}`;
}

export function getConfig() {
    return JSON.stringify({
        name: 'nyafun.js',
        useWebview: true,
    });
}