// Benefícios do motociclista em Itajubá. Sem `almoco`, lista as regras (vitrine);
// com `almoco` (de almocoStatus), mostra a situação da pessoa.
export default function Vantagens({ almoco, comCodigo = false }) {
  const textoAlmoco = !almoco ? 'Complete as 4 estações do mesmo ano, confirmadas no balcão, e ganhe um almoço.'
    : almoco.disponivel ? `Liberado: você completou ${almoco.ano}. Mostre seu código em um parceiro.`
    : almoco.usadoEm ? `Almoço de ${almoco.ano} já aproveitado. Complete o próximo ano para outro.`
    : 'Complete as 4 estações do mesmo ano, confirmadas no balcão, e ganhe um almoço.';
  return (
    <ul className="selo-vantagens">
      <li><strong>Cafezinho de boas-vindas</strong><span>Grátis para quem chega de moto.</span></li>
      <li data-ok={comCodigo || undefined}><strong>10% de desconto</strong><span>{comCodigo ? 'Mostre o código acima nos parceiros do Selo.' : 'Com o código que o passaporte libera depois do cadastro e do check-in.'}</span></li>
      <li data-ok={almoco?.disponivel || undefined}><strong>Almoço grátis</strong><span>{textoAlmoco}</span></li>
    </ul>
  );
}
