import { bellagestClient } from './bellagestClient';

// Exportar métodos do bellagestClient para manter compatibilidade
export const Empresa = {
  list: bellagestClient.getEmpresas,
  get: bellagestClient.getEmpresa,
  create: bellagestClient.createEmpresa,
  update: bellagestClient.updateEmpresa,
  delete: bellagestClient.deleteEmpresa
};

export const Cliente = {
  list: bellagestClient.getClientes,
  get: bellagestClient.getCliente,
  create: bellagestClient.createCliente,
  update: bellagestClient.updateCliente,
  delete: bellagestClient.deleteCliente
};

export const Profissional = {
  list: bellagestClient.getProfissionais,
  get: bellagestClient.getProfissional,
  create: bellagestClient.createProfissional,
  update: bellagestClient.updateProfissional,
  delete: bellagestClient.deleteProfissional
};

export const Servico = {
  list: bellagestClient.getServicos,
  get: bellagestClient.getServico,
  create: bellagestClient.createServico,
  update: bellagestClient.updateServico,
  delete: bellagestClient.deleteServico
};

export const Agendamento = {
  list: bellagestClient.getAgendamentos,
  get: bellagestClient.getAgendamento,
  create: bellagestClient.createAgendamento,
  update: bellagestClient.updateAgendamento,
  delete: bellagestClient.deleteAgendamento
};

export const Produto = {
  list: bellagestClient.getProdutos,
  get: bellagestClient.getProduto,
  create: bellagestClient.createProduto,
  update: bellagestClient.updateProduto,
  delete: bellagestClient.deleteProduto
};

export const Venda = {
  list: bellagestClient.getVendas,
  get: bellagestClient.getVenda,
  create: bellagestClient.createVenda,
  update: bellagestClient.updateVenda,
  delete: bellagestClient.deleteVenda
};

export const MovimentacaoEstoque = {
  list: bellagestClient.getMovimentacoesEstoque,
  get: bellagestClient.getMovimentacaoEstoque,
  create: bellagestClient.createMovimentacaoEstoque,
  update: bellagestClient.updateMovimentacaoEstoque,
  delete: bellagestClient.deleteMovimentacaoEstoque
};

export const Plano = {
  list: bellagestClient.getPlanos,
  get: bellagestClient.getPlano,
  create: bellagestClient.createPlano,
  update: bellagestClient.updatePlano,
  delete: bellagestClient.deletePlano
};

export const Cobranca = {
  list: bellagestClient.getCobrancas,
  get: bellagestClient.getCobranca,
  create: bellagestClient.createCobranca,
  update: bellagestClient.updateCobranca,
  delete: bellagestClient.deleteCobranca
};

export const Papel = {
  // Placeholder para papéis - pode ser implementado depois
  list: () => Promise.resolve([]),
  get: () => Promise.resolve(null),
  create: () => Promise.resolve(null),
  update: () => Promise.resolve(null),
  delete: () => Promise.resolve(null)
};

// Auth methods
export const User = {
  login: bellagestClient.login,
  register: bellagestClient.register,
  getCurrentUser: bellagestClient.getCurrentUser
};