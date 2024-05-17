const parser = require('node-html-parser');
const parse = parser.parse;

export async function search(keyword) {
    const baseUrl = 'https://anime.girigirilove.com';
    const resp = await fetch(`https://anime.girigirilove.com/search/-------------/?wd=${keyword}`);
    const html = await resp.text();
    const root = parse(html);
  
    const ret = root.querySelectorAll('.public-list-box').map(div => {
      let image;
      const style = div.querySelector('.cover')?.getAttribute('style');
      const regExp = /url\((.*?)\)/;
      const match = regExp.exec(style);
      if (style && match) {
        const url = match[1];
        image = baseUrl + url;
      }
  
      const name = div.querySelector('.thumb-txt').text;
      const desc = div.querySelector('.thumb-blurb').text;
      const id = div.querySelector('.thumb-menu').firstChild.getAttribute('href').replace(/\//g, '');
  
      return {
        seriesId: id,
        name: name,
        description: desc,
        image: image
      };
    });
    return JSON.stringify(ret);
}

export async function getSources(seriesId) {
    console.log(seriesId);
    const resp = await fetch(`https://anime.girigirilove.com/${seriesId}`);
    const html = await resp.text();
    const doc = parse(html);
    const uls = doc.querySelectorAll('.anthology-list-play');

    const sources = [];
    uls.forEach((ul) => {
        const episodes = [];
        ul.querySelectorAll('li').forEach((li, idx) => {
            const href = li.querySelector('a').getAttribute('href').replace(/\//g, '');
            episodes.push({ episodeId: href, episode: idx });
        });
        sources.push({ episodes });
    });

    return JSON.stringify(sources);
}

export function getConfig() {
  return JSON.stringify({
    name: 'Girigiri-js',
    description: 'Girigiri适配器，但是js',
  });
}

function decode(input) {
  // Credit: https://github.com/mathiasbynens/base64
	var REGEX_SPACE_CHARACTERS = /[\t\n\f\r ]/g;
	var TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  input = String(input)
    .replace(REGEX_SPACE_CHARACTERS, '');
  var length = input.length;
  if (length % 4 == 0) {
    input = input.replace(/==?$/, '');
    length = input.length;
  }
  if (
    length % 4 == 1 ||
    // http://whatwg.org/C#alphanumeric-ascii-characters
    /[^+a-zA-Z0-9/]/.test(input)
  ) {
    error(
      'Invalid character: the string to be decoded is not correctly encoded.'
    );
  }
  var bitCounter = 0;
  var bitStorage;
  var buffer;
  var output = '';
  var position = -1;
  while (++position < length) {
    buffer = TABLE.indexOf(input.charAt(position));
    bitStorage = bitCounter % 4 ? bitStorage * 64 + buffer : buffer;
    // Unless this is the first of a group of 4 characters…
    if (bitCounter++ % 4) {
      // …convert the first 8 bits to a single ASCII character.
      output += String.fromCharCode(
        0xFF & bitStorage >> (-2 * bitCounter & 6)
      );
    }
  }
  return output;
}

export async function getVideoResource(episodeId) {
  const resp = await fetch(`https://anime.girigirilove.com/${episodeId}`);
  const html = await resp.text();
  const root = parse(html);
  let div = root.querySelector('.player-left');
  div = div || root.querySelector('.player-top');

  if (!div) {
    return '';
  }

  const scriptText = div.querySelector('script').textContent;
  const scriptLines = scriptText.split(',').map(e => e.trim());

  for (const line of scriptLines) {
    if (line.includes('"url"')) {
      const encoded = line.split(':')[1].replace(/"/g, '').replace(/,/g, '');
      const decoded = decode(encoded, 'base64');
      const videoLink = decodeURIComponent(decoded); 
      
      console.log('Parsed video link:', videoLink);
      return videoLink;
    }
  }

  return ''; 
}