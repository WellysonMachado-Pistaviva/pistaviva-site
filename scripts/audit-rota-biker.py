"""Read-only checks for the public Rota Biker hub and state pages.
Usage: python3 scripts/audit-rota-biker.py [--output report.json]
Checks eligibility signals, not Google indexation or ranking.
"""
import argparse
import json
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import urlopen
from xml.etree import ElementTree

BASE = 'https://www.pistavivamototurismo.com.br'
HUB = '/destinos/roteiros/monumentos-bikers'
STATES = ['bahia', 'distrito-federal', 'goias', 'minas-gerais', 'paraiba',
          'parana', 'rio-grande-do-sul', 'santa-catarina', 'sao-paulo', 'paraguai']

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonical = []
        self.robots = []
        self.h1 = 0
        self.title = ''
        self.in_title = False
        self.in_schema = False
        self.schema_text = ''
        self.schemas = []
        self.description = ''

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical.append(attrs.get('href'))
        if tag == 'meta' and attrs.get('name') in ('robots', 'googlebot'):
            self.robots.append(attrs.get('content', ''))
        if tag == 'meta' and attrs.get('name') == 'description':
            self.description = attrs.get('content', '')
        if tag == 'h1':
            self.h1 += 1
        if tag == 'title':
            self.in_title = True
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.in_schema = True
            self.schema_text = ''

    def handle_data(self, text):
        if self.in_title:
            self.title += text
        if self.in_schema:
            self.schema_text += text

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False
        if tag == 'script' and self.in_schema:
            self.in_schema = False
            self.schemas.append(json.loads(self.schema_text))


def schema_types(value):
    if isinstance(value, dict):
        kind = value.get('@type', [])
        yield from ([kind] if isinstance(kind, str) else kind)
        for child in value.values():
            yield from schema_types(child)
    elif isinstance(value, list):
        for child in value:
            yield from schema_types(child)


def audit(path, sitemap):
    url = BASE + path
    try:
        with urlopen(url, timeout=30) as response:
            page = Page()
            page.feed(response.read().decode('utf-8'))
            robots = ','.join(page.robots + response.headers.get_all('X-Robots-Tag', []))
            checks = {
                'http_200': response.status == 200,
                'no_redirect': response.url == url,
                'canonical_self': page.canonical == [url],
                'no_noindex': 'noindex' not in robots.lower() and 'none' not in robots.lower(),
                'single_h1': page.h1 == 1,
                'title_present': bool(page.title.strip()),
                'description_present': bool(page.description.strip()),
                'in_sitemap': url in sitemap,
                'collection_schema': 'CollectionPage' in set(schema_types(page.schemas)),
            }
            return {'url': url, 'title': page.title, 'checks': checks,
                    'breadcrumb_present': 'BreadcrumbList' in set(schema_types(page.schemas)),
                    'passed': all(checks.values())}
    except Exception as error:
        return {'url': url, 'passed': False, 'error': str(error)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    with urlopen(BASE + '/sitemap.xml', timeout=30) as response:
        root = ElementTree.fromstring(response.read())
    sitemap = {node.text for node in root.findall('{*}url/{*}loc')}
    paths = [HUB] + ['/destinos/monumentos/' + state for state in STATES]
    with ThreadPoolExecutor(max_workers=4) as pool:
        pages = list(pool.map(lambda path: audit(path, sitemap), paths))
    report = {'checked_at_utc': datetime.now(timezone.utc).isoformat(),
              'scope': 'Public HTML and sitemap signals; not Google ranking or indexation.',
              'pages': pages}
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    for page in pages:
        print(('OK' if page['passed'] else 'FAIL'), page['url'])
    raise SystemExit(0 if all(page['passed'] for page in pages) else 1)

if __name__ == '__main__':
    main()
