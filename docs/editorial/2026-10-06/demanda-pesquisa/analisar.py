import csv,json,re,unicodedata
from pathlib import Path
src=Path('/Users/wellysonmachado/Downloads/instagram');out=Path(__file__).parent
load=lambda n:list(csv.DictReader((src/n).open(encoding='utf-8-sig',newline='')))
def norm(s):return ''.join(c for c in unicodedata.normalize('NFD',s.lower()) if unicodedata.category(c)!='Mn')
def group(q):
 s=norm(q)
 if 'bmw' in s or 'motorrad' in s:return 'BMW'
 if 'lourenco' in s or re.search(r'\b35\b',s):return 'Monumento 35 / São Lourenço'
 if 'bau' in s or 'sapucai' in s or re.search(r'\b27\b',s):return 'Monumento 27 / Pedra do Baú'
 if 'barreiro' in s or re.search(r'\b29\b',s):return 'Monumento 29 / São José do Barreiro'
 if re.search(r'\b68\b',s):return 'Rota 68'
 if 'perto de mim' in s or 'proximo de mim' in s:return 'Perto de mim'
 if re.search(r'\b22\b',s) or 'tres coracoes' in s or 'mata virgem' in s:return 'Monumento 22 / Três Corações'
 if 'biker' in s:return 'Outras buscas biker'
 return 'Outras'
queries=load('Consultas.csv');groups={}
for r in queries:
 g=group(r['Top consultas']);v=groups.setdefault(g,{'cliques':0,'impressoes':0,'consultas':0});v['cliques']+=int(r['Cliques']);v['impressoes']+=int(r['Impressões']);v['consultas']+=1
for v in groups.values():v['ctr_percentual']=round(v['cliques']/v['impressoes']*100,2)
chart=load('Gráfico.csv');posts=load('Posts.csv');devices=load('Dispositivos.csv');countries=load('Países.csv');appearance=load('Aspecto da pesquisa.csv');filters=load('Filtros.csv')
summary={'periodo':[chart[0]['Data'],chart[-1]['Data']],'filtros':filters,'total_grafico':{'cliques':sum(int(r['Cliques']) for r in chart),'impressoes':sum(int(r['Impressões']) for r in chart)},'total_consultas':{'cliques':sum(int(r['Cliques']) for r in queries),'impressoes':sum(int(r['Impressões']) for r in queries)},'total_linhas_posts':{'cliques':sum(int(r['Cliques']) for r in posts),'impressoes':sum(int(r['Impressões']) for r in posts)},'grupos_consultas':groups,'dispositivos':devices,'paises':countries,'aspecto':appearance,'top_posts':posts[:18],'notas':['Métricas de pesquisa Web direcionadas a URLs do Instagram; não são Insights nem métricas do portal.','Totais das dimensões diferem; não somar gráfico, posts e consultas. Causa da diferença não identificável somente pelos arquivos.','URLs p/reel e parâmetros podem identificar mesmo conteúdo. Grupos de consultas são editoriais, exclusivos por regra; não cruzam consulta e post.','Não há série comparativa nos CSVs: percentuais de crescimento aparecem somente nos prints.']}
(out/'analise.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
with (out/'consultas-classificadas.csv').open('w',newline='',encoding='utf-8-sig') as f:
 w=csv.DictWriter(f,fieldnames=['Grupo',*queries[0].keys()]);w.writeheader();w.writerows({'Grupo':group(r['Top consultas']),**r} for r in queries)
print(json.dumps(summary['total_grafico']));print('Grupos:',len(groups),'Consultas:',len(queries))
