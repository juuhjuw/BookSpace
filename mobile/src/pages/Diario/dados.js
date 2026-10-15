
// dados simulados para a entrega 02 -- Depois serão substituidos por dados do banco
export const DADOS_DIARIO = [
  {
    id: '1',
    categoria: 'Discussão grave',
    descricao: 'Após o jantar houve agressão verbal e quebra de objetos',
    data_ocorrencia: '14/10/2026 22:00'
  },

  {
    id: '2',
    categoria:'Ameaça de isolamento',
    descricao:'Fui proibida de ter contato com a familia e controle do meu celular',
    data_ocorrencia:'05/10/2026 17:25'
  },
  {
    id:'3',
    categoria:'Violência Psicológica',
    descricao:'Mensagens de perseguição',
    data_ocorrencia:'23/09/2026 09:13',
  }, 
  {
    id: '4',
    categoria: 'Violência Patrimonial',
    descricao: 'Retenção de cartão bancário e pertences pessoais.',
    data_ocorrencia: '17/09/2026 18:45'
  },
  {
    id: '5',
    categoria: 'Violência Moral',
    descricao: 'Ofensas e xingamentos em frente de terceiros.',
    data_ocorrencia: '10/09/2026 11:20'
  }
];

// Categorias fixas para melhor análise do datascience
export const CATEGORIAS_FIXAS = [
  'Violência Física',
  'Violência Psicológica',
  'Violência Moral',
  'Violência Patrimonial',
  'Violência Sexual',
  'Outros / Relato Geral'
];
