#!/usr/bin/env python3
"""Read public sitemap and inspect server-rendered SEO signals; no Google rank estimates."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from html.parser import HTMLParser
import json
from pathlib import Path
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = []
        self.headings = []
        self.canonicals = []
        self.description = []
        self.robots = []
        self.links = []
        self.schemas = []
        self.errors = []
        self.active = None
        self.buffer = []
        self.svg_depth = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'svg':
            self.svg_depth += 1
        if (tag in ('title', 'h1') and not self.svg_depth) or (tag == 'script' and attrs.get('type') == 'application/ld+json'):
            self.active, self.buffer = tag, []
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonicals.append(attrs.get('href'))
        if tag == 'meta':
            name = attrs.get('name', '').lower()
            if name == 'description':
                self.description.append(attrs.get('content', ''))
            if name in ('robots', 'googlebot'):
                self.robots.append(attrs.get('content', ''))
        if tag == 'a' and attrs.get('href'):
            self.links.append(attrs['href'])

    def handle_data(self, data):
        if self.active:
            self.buffer.append(data)

    def handle_endtag(self, tag):
        if tag == 'svg':
            self.svg_depth = max(0, self.svg_depth - 1)
        if tag != self.active:
            return
        value = ''.join(self.buffer).strip()
        if tag == 'title':
            self.title.append(value)
        elif tag == 'h1':
            self.headings.append(value)
        else:
            try:
                self.schemas.append(json.loads(value))
            except ValueError:
                self.errors.append('invalid JSON-LD')
        self.active, self.buffer = None, []


def fetch(url):
    with urlopen(Request(url, headers={'User-Agent': 'Pistaviva-SEO-Audit/1.0'}), timeout=30) as response:
        return response.status, response.geturl(), response.headers, response.read().decode('utf-8')


def inspect(url):
    try:
        status, final_url, headers, body = fetch(url)
        page = Page()
        page.feed(body)
        issues = list(page.errors)
        if len(page.title) != 1 or not page.title[0]:
            issues.append('missing or multiple titles')
        if len(page.headings) != 1:
            issues.append('expected one h1')
        if len(page.description) != 1 or not page.description[0]:
            issues.append('missing or multiple descriptions')
        if page.canonicals != [url]:
            issues.append('canonical differs from sitemap URL')
        if 'noindex' in ','.join(page.robots + [headers.get('X-Robots-Tag', '')]).lower():
            issues.append('sitemap URL is noindex')
        if final_url != url:
            issues.append('sitemap URL redirects')
        return {'url': url, 'status': status, 'final_url': final_url, 'title': page.title,
                'h1': page.headings, 'canonical': page.canonicals, 'description': page.description,
                'jsonld_count': len(page.schemas), 'links': sorted(set(page.links)), 'issues': issues}
    except Exception as error:
        return {'url': url, 'issues': [str(error)]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base', default='https://www.pistavivamototurismo.com.br')
    parser.add_argument('--limit', type=int, default=0, help='0 checks every sitemap URL')
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    base = args.base.rstrip('/')
    _, _, _, sitemap = fetch(base + '/sitemap.xml')
    root = ET.fromstring(sitemap)
    urls = [node.text for node in root.findall('{*}url/{*}loc')]
    if not urls:
        raise SystemExit('Sitemap has no URLs (sitemap indexes are not supported).')
    selected = urls[:args.limit] if args.limit else urls
    with ThreadPoolExecutor(max_workers=4) as pool:
        pages = list(pool.map(inspect, selected))
    report = {'checked_at': datetime.now(timezone.utc).isoformat(), 'base': base,
              'sitemap_urls': len(urls), 'checked_urls': len(pages), 'pages': pages}
    target = Path(args.output)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    problems = [page for page in pages if page['issues']]
    print(json.dumps({'sitemap_urls': len(urls), 'checked_urls': len(pages),
                      'pages_with_issues': len(problems), 'report': str(target)}, ensure_ascii=False))
    for page in problems:
        print(page['url'], ':', '; '.join(page['issues']))
    raise SystemExit(1 if problems else 0)


if __name__ == '__main__':
    main()
