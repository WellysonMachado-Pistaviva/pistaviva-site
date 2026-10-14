"""Build a sourced national catalogue from cached IBGE histories and supplied CSV.

Read-only inputs: .cache/selos-historicos/{ibge}.json and conteudo/selos/municipios.csv.
Never infer a foundation year from district creation, installation, or publication year.
"""
import csv
import html
import json
import pathlib
import re
import unicodedata

ROOT = pathlib.Path(__file__).resolve().parent.parent


def clean(text):
    text = re.sub(r'(?<=\d)\xad(?=\d)', '-', text or '').replace('\xad', '')
    return re.sub(r'\s+', ' ', html.unescape(re.sub('<[^>]+>', '', text)).replace('–', '-')).strip()


def slug(text):
    return re.sub('[^a-z0-9]+', '-', unicodedata.normalize('NFD', text).encode('ascii', 'ignore').decode().lower()).strip('-')


def administrative_date(record):
    text = record.get('FORMACAO_ADMINISTRATIVA') or re.split(r'Forma[çc][ãa]o Administrativa', record.get('HISTORICO', ''), flags=re.I)[-1]
    text = clean(text)
    # An explicit elevation to municipality/vila, followed by its legal date.
    # Avoid district dates and later dates of installation.
    match = re.search(r'Elevad[oa]\s+[àáa]\s+c[a]?tegoria\s+(?:d[eo]\s+)?(?:munic[ií]pio|vila)\b(.{0,450})', text, re.I)
    if not match:
        return None
    clause = re.split(r'\b(?:Instalad[oa]|Sede|Constituíd[oa]|Pela Lei|Pelo Decreto)\b', match[1])[0]
    date = re.search(r'\b\d{1,2}\s*[-/]\s*\d{1,2}\s*[-/]\s*(1[5-9]\d{2}|20[0-2]\d)\b|\b\d{1,2}\s+de\s+[a-zç]+\s+(?:de\s+)?(1[5-9]\d{2}|20[0-2]\d)\b|\bem\s+(1[5-9]\d{2}|20[0-2]\d)\b', clause, re.I)
    if not date:
        return None
    year = int(next(g for g in date.groups() if g))
    return {'ano': year, 'tipoAno': 'Emancipação', 'evidencia': clean(match[0][:match[0].index(clause) + date.end()])}


def excerpt(record):
    text = record.get('HISTORICO', '')
    # Skip file headings. Use a short, attributed historical excerpt, never an AI-invented claim.
    text = re.split(r'Forma[çc][ãa]o Administrativa', text, flags=re.I)[0]
    lines = [clean(s) for s in text.splitlines()]
    lines = [s for s in lines if len(s) > 75 and not re.match(r'(Fonte|Gentílico|http)', s, re.I)]
    if not lines:
        return None
    sentence = re.split(r'(?<=[.!?])\s+', lines[0])[0]
    if len(sentence) > 260:
        sentence = sentence[:250].rsplit(' ', 1)[0] + '…'
    return sentence


def main():
    cities = json.loads((ROOT / 'app/lib/municipios.json').read_text())
    routes = json.loads((ROOT / 'app/lib/selo/municipiosRota.json').read_text())['municipios']
    route = {str(c['ibge']): c for c in routes}
    supplied = {c['ibge']: c for c in csv.DictReader((ROOT / 'conteudo/selos/municipios.csv').open())}
    overrides_path = ROOT / 'conteudo/selos/datas-revisadas.json'
    overrides = json.loads(overrides_path.read_text()) if overrides_path.exists() else {}
    result = []
    for uf, rows in cities.items():
        for name, code in rows:
            path = ROOT / f'.cache/selos-historicos/{code}.json'
            record = json.loads(path.read_text()) if path.exists() else {}
            source = f'https://servicodados.ibge.gov.br/api/v1/biblioteca?aspas=3&codmun={code}'
            data = administrative_date(record) or {'ano': None, 'tipoAno': None, 'evidencia': None}
            pdf_path = ROOT / f'.cache/selos-pdfs/{code}.json'
            if not data['ano'] and pdf_path.exists():
                pdf = json.loads(pdf_path.read_text())
                parsed = administrative_date({'HISTORICO': pdf['texto']})
                if parsed:
                    data = {**parsed, 'fonteDataUrl': pdf['fonte']}
            before = supplied.get(code, {})
            # Supplied dates explicitly describe political emancipation, not foundation.
            if before.get('ano') and not before.get('revisar'):
                data = {'ano': int(before['ano']), 'tipoAno': 'Emancipação', 'evidencia': before.get('lei'), 'fonteData': 'Planilha fornecida: selos-dados.xlsx / ' + uf}
            if code in overrides:
                data = overrides[code]
            elif before.get('revisar'):
                data = {'ano': None, 'tipoAno': None, 'evidencia': None}
            r = route.get(code)
            result.append({
                'ibge': code, 'slug': slug(name) + '-' + uf.lower(), 'nome': name, 'uf': uf,
                'naRota': bool(r), 'ordem': r['ordem'] if r else None,
                'monumentos': r['monumentos'] if r else [],
                'frase': before.get('frase') or ('Pelos caminhos de ' + uf if r else 'Descubra ' + name),
                'resumo': excerpt(record) or f'{name} é um município de {clean(record.get("ESTADO", uf))}.',
                'citacao': bool(excerpt(record)), 'fonte': source,
                **data,
            })
    result.sort(key=lambda c: (not c['naRota'], not bool(c['monumentos']), c['uf'], c['ordem'] or 0, c['nome']))
    target = ROOT / 'app/lib/selo/municipiosBrasil.json'
    target.write_text(json.dumps(result, ensure_ascii=False, separators=(',', ':')) + '\n')
    missing = [c for c in result if not c['ano']]
    (ROOT / 'conteudo/selos/datas-pendentes.csv').write_text('ibge,municipio,uf,na_rota,fonte\n' + '\n'.join(f'{c["ibge"]},{c["nome"]},{c["uf"]},{c["naRota"]},{c["fonte"]}' for c in missing) + '\n')
    print({'municipios': len(result), 'na_rota': sum(c['naRota'] for c in result), 'com_ano': sum(bool(c['ano']) for c in result), 'rota_sem_ano': [(c['ibge'], c['nome'], c['uf']) for c in missing if c['naRota']]})


if __name__ == '__main__':
    main()
