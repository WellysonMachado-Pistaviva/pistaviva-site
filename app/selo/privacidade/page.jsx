import Link from 'next/link';
import SeloNav from '../SeloNav';
import '../selo-publico.css';

export const metadata = { title: 'Privacidade do passaporte' };

export default function SeloPrivacidadePage() {
  return (
    <><SeloNav /><div className="selo-wrap selo-texto selo-public-page">
      <h1>Privacidade do passaporte</h1>

      <h2>Quais dados</h2>
      <p>Nome, WhatsApp pessoal, cidade e estado, cidades carimbadas com datas e números de série e, se você enviar, fotos e relatos das passagens. No Selo da Estação, também registramos por onde passou no dia, data e hora da visita, distância até o Parque e precisão do GPS, ou a foto do passaporte carimbado. Se você quiser o código de benefício, também o endereço (CEP, rua, número, complemento e bairro).</p>

      <h2>Para quê</h2>
      <ul>
        <li>Liberar o selo da estação no balcão e manter seu número de colecionador e certificar as visitas presenciais.</li>
        <li>Saber de onde vêm os visitantes do Parque da Cidade de Itajubá (relatórios sem identificar ninguém).</li>
        <li>WhatsApp: identifica seu cadastro e evita selos repetidos na mesma estação. O telefone não aparece no passaporte público. Você pode entrar com telefone e senha; recuperar a senha exige o código de recuperação guardado por você. Sem essas formas de acesso, procure a equipe para confirmar sua identidade.</li>
        <li>Localização: consultada quando você toca em carimbar. O servidor usa o ponto para identificar o município ou conferir a distância até o Parque, sem guardar latitude e longitude. No Parque, adesivo e certificação continuam sendo confirmados no balcão.</li>
        <li>Foto do passaporte: serve apenas para a equipe conferir o check-in. Não é publicada.</li>
        <li>Endereço: libera e valida seu código de benefício de colecionador. Não é publicado nem usado para enviar correspondência.</li>
        <li>Foto: só aparece no mural e nas redes do Parque e da Capital da Mantiqueira se você autorizar e depois de aprovada pela equipe.</li>
        <li>Foto de cidade: começa privada. Se você marcar a publicação, aparece no mapa com seu primeiro nome, inicial do sobrenome e número de colecionador. Essa escolha é independente de publicar seu passaporte.</li>
        <li>Relatos de passagens: ficam privados. Publicar o passaporte não publica os relatos.</li>
      </ul>

      <h2>Dados neste aparelho e modo estrada</h2>
      <p>Ao criar ou ativar acesso com senha, guardamos somente uma representação protegida da senha e do código de recuperação. Senha e código não aparecem no perfil público. O código é gerado pelo site, sem envio de SMS ou WhatsApp, e deve ser guardado por você. Na recuperação, as iniciais do nome, os últimos quatro dígitos do telefone e a cidade/UF ajudam a identificar o cadastro; o código salvo é obrigatório para trocar a senha.</p>
      <p>Recuperar o acesso substitui o código de recuperação e invalida links pessoais anteriores. Sem senha, link pessoal ou código guardado, fale com a equipe para confirmar sua identidade. Conhecer os dados do cadastro, por si só, não libera acesso.</p>
      <p>O navegador pode guardar o acesso ao seu passaporte, uma cópia resumida da coleção e a foto de identificação escolhida para montar imagens. Ao tocar em “Salvar identificação no cadastro”, nome do piloto, garupa, origem, assinatura e foto de identificação também ficam guardados no servidor, em área privada, para você abrir em outro celular. Essa foto não é publicada no perfil público. A equipe pode consultar esses dados e baixar a foto pelo painel administrativo. Editar o modelo de exemplo não envia fotos.</p>
      <p>Dados de cadastro e visitas podem ser exportados pela equipe para planilha de acesso restrito. Fotos ficam no armazenamento privado do site; a planilha informa se existe foto, sem incluir senhas, códigos de recuperação ou links pessoais. Fotos das passagens enviadas também são guardadas no servidor. A cópia local da foto é vinculada ao perfil que a escolheu.</p>
      <p>Sem conexão, a leitura do GPS, precisão e horário ficam temporariamente neste aparelho até o envio. Abra o passaporte com internet em até 72 horas para confirmar a passagem. Ela ainda não é um carimbo confirmado. “Esquecer este celular” remove perfil, foto de identificação, resumo e pendências desse passaporte; não exclui a coleção no servidor nem invalida seu link pessoal.</p>

      <h2>Perfil público, ranking e feed do site</h2>
      <p>Completar quatro estações confirmadas no mesmo ano permite receber seu certificado. Você pode participar do ranking a partir da primeira estação confirmada no balcão. Publicar é opcional: divulgamos nome, cidade/UF, número de colecionador, estações confirmadas, datas e progresso dos anos autorizados, após sua autorização específica e aprovação da equipe. O perfil público usa seu número de colecionador. Seu telefone, endereço, fotos de comprovação e link privado não aparecem.</p>
      <p>Publicar o passaporte de cidades é outra escolha opcional: mostra primeiro nome com inicial, cidade/UF, número, cidades e datas das passagens. Você pode fechar essa página pela sua coleção. A autorização de cada ano do ranking das estações é separada; retirá-la não apaga seus carimbos ou certificado. Fotos, relatos, telefone, endereço e link privado não entram no passaporte público.</p>
      <h2>Grupo de WhatsApp</h2>
      <p>Quando houver um convite disponível, você escolhe se quer entrar pelo WhatsApp. Não adicionamos ninguém automaticamente. Ao entrar, seu número poderá ficar visível aos participantes do grupo.</p>

      <h2>Por quanto tempo</h2>
      <p>Mantemos os dados associados ao seu cadastro para preservar seu número e sua coleção entre as estações. Você pode solicitar a exclusão do cadastro.</p>

      <h2>Seus direitos</h2>
      <p>Você pode pedir para ver, corrigir ou apagar seus dados e retirar a autorização da foto a qualquer momento. <Link href="/contato">Fale com a equipe da Pista Viva</Link> ou procure o balcão do Parque da Cidade de Itajubá. A equipe precisa confirmar sua identidade antes de alterar ou liberar acesso a dados privados.</p>

      <p><Link href="/selo/passaporte">Voltar ao passaporte</Link></p>
    </div></>
  );
}
