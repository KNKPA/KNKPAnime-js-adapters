const parser = require('node-html-parser');
const parse = parser.parse;

export async function search(keyword) {
    const resp = await fetch(`https://www.libvio.pw/search/-------------.html?wd=${keyword}`);
    const html = await resp.text();
    const doc = parse(html);

    const divs = doc.querySelectorAll('.stui-vodlist__box');
    const ret = divs.map(div => {
        const a = div.querySelector('a');
        const seriesId = a.attributes.href;
        const name = a.attributes.title;
        const image = a.attributes['data-original'];
        return {
            seriesId,
            name,
            image,
        };
    });
    return JSON.stringify(ret);
}

export async function getSources(seriesId) {
    const resp = await fetch(`https://www.libvio.pw${seriesId}`);
    const doc = parse(await resp.text());
    const ul = doc.querySelector('.stui-content__playlist');
    const episodes = ul.childNodes.map(li => {
        const a = li.querySelector('a');
        return {
            episodeId: a.attributes.href,
            episode: ul.childNodes.indexOf(li),
        };
    })
    return JSON.stringify([{
        episodes,
    }])
}

export async function play(episodeId) {
    return `https://www.libvio.pw${episodeId}`;
}

export function getConfig() {
    return JSON.stringify({
        name: 'libvio.js',
        useWebview: true,
    });
}