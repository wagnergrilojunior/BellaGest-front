// Utilitário para gerenciar a empresa selecionada
export const getEmpresaSelecionada = () => {
  try {
    if (typeof window === 'undefined') return null;
    
    const empresa = localStorage.getItem('empresa_selecionada');
    return empresa ? JSON.parse(empresa) : null;
  } catch (error) {
    console.error('Erro ao recuperar empresa selecionada:', error);
    return null;
  }
};

export const setEmpresaSelecionada = (empresa) => {
  try {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('empresa_selecionada', JSON.stringify(empresa));
  } catch (error) {
    console.error('Erro ao salvar empresa selecionada:', error);
  }
};

export const clearEmpresaSelecionada = () => {
  try {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('empresa_selecionada');
  } catch (error) {
    console.error('Erro ao limpar empresa selecionada:', error);
  }
};