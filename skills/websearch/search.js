import { env } from 'node:process';

const query = process.argv.slice(2).find((a) => !a.startsWith('--')) || '';
const isJson = process.argv.includes('--json');
const rawLimit = process.argv[process.argv.indexOf('--limit') + 1];
const limit = Number.isFinite(Number(rawLimit)) ? Number(rawLimit) : 10;

async function braveSearch(q) {
  const key = env.BRAVE_API_KEY;
  if (!key) throw new Error('BRAVE_API_KEY not set');

  const url = new URL('https://api.search.brave.com/res/v1/web/search');
  url.searchParams.set('q', q);
  url.searchParams.set('count', String(limit));
  url.searchParams.set('offset', '0');

  const resp = await fetch(url, {
    headers: {
      'X-Subscription-Token': key,
      'Accept': 'application/json',
    },
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Brave API ${resp.status}: ${text}`);
  }

  const data = await resp.json();
  return (data.web?.results || []).map((r) => ({
    title: r.title || '',
    url: r.url || '',
    description: r.description || '',
    source: 'brave',
  }));
}

async function ddgSearch(q) {
  const body = new URLSearchParams({ q: q, kl: 'en-us' });

  const resp = await fetch('https://html.duckduckgo.com/html/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.0',
    },
    body: body.toString(),
  });

  if (!resp.ok) throw new Error(`DuckDuckGo returned ${resp.status}`);

  const html = await resp.text();
  const { load } = await import('cheerio');
  const $ = load(html);
  const results = [];

  $('.result').each((_i, el) => {
    if (results.length >= limit) return false;
    const title = $(el).find('.result__a').text().trim();
    let url = $(el).find('.result__a').attr('href');
    const description = $(el).find('.result__snippet').text().trim();

    if (!title || !url) return;
    if (url.startsWith('//')) url = 'https:' + url;
    if (url.startsWith('/')) url = 'https://duckduckgo.com' + url;

    results.push({ title, url, description, source: 'ddg' });
  });

  return results;
}

async function main() {
  if (!query) {
    console.error('Usage: node search.js <query> [--json] [--limit N]');
    process.exit(1);
  }

  try {
    let results;
    const useBrave = !!env.BRAVE_API_KEY;

    if (useBrave) {
      results = await braveSearch(query);
    } else {
      results = await ddgSearch(query);
    }

    if (isJson) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      if (results.length === 0) {
        console.log('No results found.');
      } else {
        for (const r of results) {
          console.log(`## ${r.title}`);
          console.log(`**Source:** ${r.source}`);
          console.log(`**URL:** ${r.url}`);
          if (r.description) console.log(`${r.description}`);
          console.log('');
        }
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
