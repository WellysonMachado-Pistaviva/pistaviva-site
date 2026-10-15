"""Extract supplied vector frames; remove original outlined placeholder lettering."""
import json, re, sys
import xml.etree.ElementTree as ET
from pathlib import Path
ET.register_namespace('', 'http://www.w3.org/2000/svg')
ET.register_namespace('xlink', 'http://www.w3.org/1999/xlink')
source = Path(sys.argv[1])
configs = {
 'postal': (1, set(range(2,43)), [325,575,265,260], [380,640,165,120]),
 'cartao-original': (2, {2,3}, [110,420,590,310], [160,480,300,160]),
 'coruja-viajante': (3, None, [200,320,400,540], [290,390,220,85]),
 'coruja-quadrada': (4, None, [170,240,420,550], [230,300,290,100]),
 'coruja-escudo': (5, None, [245,345,345,395], [300,385,230,62]),
}
remove = {3:{1,3,532},4:{1,44,45},5:{1,*range(4,18)}}
result = {}
for key,(n,keep,box,area) in configs.items():
 root=ET.parse(source/f'{n}.svg').getroot()
 nodes=[e for i,e in enumerate(root) if i and (i in keep if keep else i not in remove[n])]
 body=''.join(ET.tostring(e,encoding='unicode') for e in nodes)
 defs={e.get('id'):e for e in root[0]}
 used=set(); pending=set(re.findall(r'url\(#([^)]*)\)|(?:href)="#([^"]+)"',body))
 ids={a or b for a,b in pending}
 while ids-used:
  for ident in list(ids-used):
   used.add(ident)
   if ident in defs:
    s=ET.tostring(defs[ident],encoding='unicode')
    ids.update(a or b for a,b in re.findall(r'url\(#([^)]*)\)|(?:href)="#([^"]+)"',s))
 art='<defs>'+''.join(ET.tostring(e,encoding='unicode') for ident,e in defs.items() if ident in used)+'</defs>'+body
 result[key]={'art':art,'box':box,'area':area,'arquivo':f'{n}.svg'}
Path('app/lib/selo/modelosAdicionais.json').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':')))
print({k:len(v['art']) for k,v in result.items()})
