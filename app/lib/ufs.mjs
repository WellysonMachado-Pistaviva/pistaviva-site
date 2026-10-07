// Unidades federativas e o prefixo numérico que o IBGE usa nos códigos de
// município. Compartilhado entre o formulário, a validação do servidor e o
// script que gera a lista de municípios.
export const UF_IBGE = {
  AC: '12', AL: '27', AP: '16', AM: '13', BA: '29', CE: '23', DF: '53',
  ES: '32', GO: '52', MA: '21', MT: '51', MS: '50', MG: '31', PA: '15',
  PB: '25', PR: '41', PE: '26', PI: '22', RJ: '33', RN: '24', RS: '43',
  RO: '11', RR: '14', SC: '42', SP: '35', SE: '28', TO: '17',
};
export const UFS = Object.keys(UF_IBGE);
