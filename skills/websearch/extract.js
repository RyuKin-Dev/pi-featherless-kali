import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

const url = process.argv[2];
const isJson = process.argv.includes('--json');

if (!url) {
  console.error('Usage: node extract.js <url> [--json]');
  process.exit(1);
}

async function main() {
  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const contentType = resp.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      throw new Error(`Unsupported content type: ${contentType}`);
    }

    const html = await resp.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      throw new Error('Could not extract readable content from this URL');
    }

    if (isJson) {
      console.log(
        JSON.stringify(
          {
            title: article.title || '',
            byline: article.byline || '',
            excerpt: article.excerpt || '',
            length: article.length || 0,
            textContent: article.textContent || '',
            siteName: article.siteName || '',
          },
          null,
          2
        )
      );
    } else {
      console.log(`# ${article.title || 'Untitled'}`);
      if (article.byline) console.log(`By: ${article.byline}`);
      if (article.excerpt) console.log(`> ${article.excerpt}`);
      console.log('');
      console.log(article.textContent || '');
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
