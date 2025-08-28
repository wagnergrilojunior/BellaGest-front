// Bellagest API Client
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class BellagestClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('bellagest_token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('bellagest_token', token);
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    localStorage.removeItem('bellagest_token');
  }

  // Get headers for requests
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}/api/v1${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return await this.request('/auth/me');
  }

  // Empresas
  async getEmpresas(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/empresas/?${queryString}`);
  }

  async getEmpresa(id) {
    return await this.request(`/empresas/${id}`);
  }

  async createEmpresa(data) {
    return await this.request('/empresas/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmpresa(id, data) {
    return await this.request(`/empresas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEmpresa(id) {
    return await this.request(`/empresas/${id}`, {
      method: 'DELETE',
    });
  }

  // Clientes
  async getClientes(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/clientes/?${queryString}`);
  }

  async getCliente(id) {
    return await this.request(`/clientes/${id}`);
  }

  async createCliente(data) {
    return await this.request('/clientes/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCliente(id, data) {
    return await this.request(`/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCliente(id) {
    return await this.request(`/clientes/${id}`, {
      method: 'DELETE',
    });
  }

  // Profissionais
  async getProfissionais(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/profissionais/?${queryString}`);
  }

  async getProfissional(id) {
    return await this.request(`/profissionais/${id}`);
  }

  async createProfissional(data) {
    return await this.request('/profissionais/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProfissional(id, data) {
    return await this.request(`/profissionais/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProfissional(id) {
    return await this.request(`/profissionais/${id}`, {
      method: 'DELETE',
    });
  }

  // Serviços
  async getServicos(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/servicos/?${queryString}`);
  }

  async getServico(id) {
    return await this.request(`/servicos/${id}`);
  }

  async createServico(data) {
    return await this.request('/servicos/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateServico(id, data) {
    return await this.request(`/servicos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteServico(id) {
    return await this.request(`/servicos/${id}`, {
      method: 'DELETE',
    });
  }

  // Agendamentos
  async getAgendamentos(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/agendamentos/?${queryString}`);
  }

  async getAgendamento(id) {
    return await this.request(`/agendamentos/${id}`);
  }

  async createAgendamento(data) {
    return await this.request('/agendamentos/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAgendamento(id, data) {
    return await this.request(`/agendamentos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAgendamento(id) {
    return await this.request(`/agendamentos/${id}`, {
      method: 'DELETE',
    });
  }

  // Produtos
  async getProdutos(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/produtos/?${queryString}`);
  }

  async getProduto(id) {
    return await this.request(`/produtos/${id}`);
  }

  async createProduto(data) {
    return await this.request('/produtos/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduto(id, data) {
    return await this.request(`/produtos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduto(id) {
    return await this.request(`/produtos/${id}`, {
      method: 'DELETE',
    });
  }

  // Vendas
  async getVendas(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/vendas/?${queryString}`);
  }

  async getVenda(id) {
    return await this.request(`/vendas/${id}`);
  }

  async createVenda(data) {
    return await this.request('/vendas/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVenda(id, data) {
    return await this.request(`/vendas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVenda(id) {
    return await this.request(`/vendas/${id}`, {
      method: 'DELETE',
    });
  }

  // Movimentações de Estoque
  async getMovimentacoesEstoque(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/movimentacoes-estoque/?${queryString}`);
  }

  async getMovimentacaoEstoque(id) {
    return await this.request(`/movimentacoes-estoque/${id}`);
  }

  async createMovimentacaoEstoque(data) {
    return await this.request('/movimentacoes-estoque/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMovimentacaoEstoque(id, data) {
    return await this.request(`/movimentacoes-estoque/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMovimentacaoEstoque(id) {
    return await this.request(`/movimentacoes-estoque/${id}`, {
      method: 'DELETE',
    });
  }

  // Planos
  async getPlanos(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/planos/?${queryString}`);
  }

  async getPlano(id) {
    return await this.request(`/planos/${id}`);
  }

  async createPlano(data) {
    return await this.request('/planos/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePlano(id, data) {
    return await this.request(`/planos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePlano(id) {
    return await this.request(`/planos/${id}`, {
      method: 'DELETE',
    });
  }

  // Cobranças
  async getCobrancas(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/cobrancas/?${queryString}`);
  }

  async getCobranca(id) {
    return await this.request(`/cobrancas/${id}`);
  }

  async createCobranca(data) {
    return await this.request('/cobrancas/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCobranca(id, data) {
    return await this.request(`/cobrancas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCobranca(id) {
    return await this.request(`/cobrancas/${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard
  async getDashboardMetrics(empresaId) {
    return await this.request(`/dashboard/metrics/${empresaId}`);
  }

  // File upload
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseURL}/api/v1/upload/`;
    const config = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const bellagestClient = new BellagestClient();
