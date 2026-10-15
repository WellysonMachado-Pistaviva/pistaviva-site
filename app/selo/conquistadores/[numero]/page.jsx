import { notFound, permanentRedirect } from 'next/navigation';

// O perfil público agora é um só: /selo/passaporte/{nº} (cidades + estações).
// Links antigos compartilhados continuam funcionando.
export default async function ConquistadorRedireciona({ params }) {
  const { numero } = await params;
  if (!/^[1-9]\d{0,14}$/.test(numero)) notFound();
  permanentRedirect(`/selo/passaporte/${numero}`);
}
