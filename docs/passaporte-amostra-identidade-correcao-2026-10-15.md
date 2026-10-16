# Correção: amostra preenchida e identidade do passaporte

Publicada em 15/10/2026 após usuário apontar regressão: entrada havia perdido amostra interativa e páginas relacionadas ainda tinham outra linguagem visual.

## Resultado

- Entrada `/selo/passaporte` volta a mostrar amostra preenchida antes do cadastro, para visitantes sem perfil salvo. Mesma arte oficial, foto, identificação, oito cidades ilustrativas e páginas para folhear. Nome e foto podem ser testados sem cadastro; número e carimbos são identificados como exemplos.
- Botão “Ver passaporte preenchido” salta à amostra na própria entrada. “Criar meu passaporte grátis” continua saltando diretamente ao cadastro. Editar nome na amostra pode sugerir nome no formulário; dados de exemplo não criam conta nem conquistam selos.
- Quem já tem perfil salvo encontra link para `/selo/passaporte/modelo#amostra-passaporte`, que permite explorar exemplo sem substituir coleção pessoal. Links de Estação e Conquistadores também usam essa rota, válida para visitantes com ou sem perfil.
- Selos e suas subpáginas, Mapa, Conquistadores, Estação e páginas de cidade compartilham `universo-passaporte.css`: papel oficial, tinta `--sl-ink`, vermelho `--sl-stamp`, títulos Impacted, destaques MailartRubberstamp e textos RobotoSlab. Cartões, filtros, estatísticas e chamadas acompanham identidade aprovada.
- Abertura fotográfica escura de Conquistadores foi substituída por cabeçalho do passaporte. Estação recebe mesmo cabeçalho e imagem oficial do passaporte preenchido, substituindo mockup antigo. Estação também entra na navegação contextual do passaporte no celular.

## Publicação

- Deploy promovido: `dpl_EgpHn93JEtQwNw2ZWRjpCvCoq2wt`, estado `READY`.
- URL imutável: <https://pistaviva-e3m2672n8-wellysons-projects-b1d6c92a.vercel.app>.
- URL pública: <https://www.pistavivamototurismo.com.br/selo/passaporte#amostra-passaporte>.
- Base/rollback: `dpl_32TQfknopf8aVVy5FxaMsLVq2mnz`.
- Release isolada: `/private/tmp/pistaviva-identidade-publicar-RW7vTr`. Conferidos SHA-1 dos 1.067 arquivos da base publicada; aplicado lote de 13 arquivos. Manifesto final tem 1.068 arquivos, sem variáveis, caches, dados locais ou estado dos agentes.
- Nenhuma nova migração. Alterações administrativas e de benefícios pendentes continuaram fora da release.
- Um envio intermediário capturou workspace completo; foi removido (`dpl_FT3MA2fneYegtgxpEaPgquEu1qTY`) sem receber domínio. Release final foi reenviada da pasta isolada, validada e só então promovida.

## Validação

246 testes passaram na release isolada; lint passou. Após ajuste final da rota Estação, testes de navegação e lint dos arquivos alterados passaram. Auditoria de design permaneceu com 197 desvios anteriores, sem acréscimos.

Build de produção e pré-voo do banco passaram na Vercel. Chrome com toque emulado verificou tanto URL imutável quanto domínio público:

- amostra automática antes do cadastro, âncoras posicionadas, nome editável, paginação e download JPEG;
- perfil local preservado e exemplo acessível também com conta simulada salva;
- papel, tinta e fontes calculadas nas seis telas; navegação contextual com quatro destinos;
- ausência de transbordamento em 320, 390, 430 e 844 px em paisagem;
- APIs privadas continuam recusando ausência de credencial ou código em query;
- nenhuma conta, foto, memória ou carimbo real gravado pelo teste.

Relatórios e capturas: `/private/tmp/pistaviva-identidade-local/`, `/private/tmp/pistaviva-identidade-cloud/` e `/private/tmp/pistaviva-identidade-producao/`. Manifesto, status e build: `/private/tmp/pistaviva-identidade-{manifest,status}.json` e `/private/tmp/pistaviva-identidade-build.txt`. Servidor exclusivo de homologação encerrado; demais instâncias preservadas. Validação não equivale a teste em aparelho físico.
