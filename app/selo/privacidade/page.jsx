import Link from 'next/link';

export const metadata = { title: 'Privacidade do Selo' };

export default function SeloPrivacidadePage() {
  return (
    <div className="selo-wrap selo-texto">
      <h1>Privacidade do Selo da Estação</h1>

      <h2>Quais dados</h2>
      <p>Nome, WhatsApp pessoal, cidade e estado, por onde passou no dia, data e hora da visita e, se você enviar, a sua foto. No check-in, a distância até o Parque e a precisão do GPS, ou a foto do passaporte carimbado. Se você quiser o código de benefício, também o endereço (CEP, rua, número, complemento e bairro).</p>

      <h2>Para quê</h2>
      <ul>
        <li>Liberar o selo da estação no balcão e manter seu número de colecionador e certificar as visitas presenciais.</li>
        <li>Saber de onde vêm os visitantes do Parque da Cidade de Itajubá (relatórios sem identificar ninguém).</li>
        <li>WhatsApp: identifica seu cadastro, evita selos repetidos na mesma estação e permite recuperar seu número. Não enviamos mensagens.</li>
        <li>Localização: usada só no momento do check-in para calcular a distância até o Parque. Sua posição (latitude e longitude) não é gravada. O check-in libera o selo digital; o adesivo e a certificação continuam sendo confirmados no balcão.</li>
        <li>Foto do passaporte: serve apenas para a equipe conferir o check-in. Não é publicada.</li>
        <li>Endereço: libera e valida seu código de benefício de colecionador. Não é publicado nem usado para enviar correspondência.</li>
        <li>Foto: só aparece no mural e nas redes do Parque e da Capital da Mantiqueira se você autorizar e depois de aprovada pela equipe.</li>
      </ul>

      <h2>Perfil público, ranking e feed do site</h2>
      <p>Completar quatro estações confirmadas no mesmo ano permite receber seu certificado. Você pode participar do ranking a partir da primeira estação confirmada no balcão. Publicar é opcional: divulgamos nome, cidade/UF, número de colecionador, estações confirmadas, datas e progresso dos anos autorizados, após sua autorização específica e aprovação da equipe. O perfil público usa seu número de colecionador. Seu telefone, endereço, fotos de comprovação e link privado não aparecem.</p>
      <p>Você pode retirar a autorização pela sua coleção. O ano deixa de aparecer no ranking e no perfil público. Sem anos publicados, o perfil público fica indisponível. Seu certificado continua disponível.</p>
      <h2>Grupo de WhatsApp</h2>
      <p>Quando houver um convite disponível, você escolhe se quer entrar pelo WhatsApp. Não adicionamos ninguém automaticamente. Ao entrar, seu número poderá ficar visível aos participantes do grupo.</p>

      <h2>Por quanto tempo</h2>
      <p>Mantemos os dados associados ao seu cadastro para preservar seu número e sua coleção entre as estações. Você pode solicitar a exclusão do cadastro.</p>

      <h2>Seus direitos</h2>
      <p>Você pode pedir para ver, corrigir ou apagar seus dados e retirar a autorização da foto a qualquer momento. Procure a equipe no balcão do Parque da Cidade de Itajubá.</p>

      <p><Link href="/selo">Voltar ao formulário</Link></p>
    </div>
  );
}
