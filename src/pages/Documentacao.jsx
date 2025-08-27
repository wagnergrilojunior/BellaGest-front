
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { BookText, Database, Code, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CodeBlock = ({ children, title = "JSON" }) => (
  <div className="mt-3">
    <div className="flex items-center gap-2 mb-2">
      <Code className="w-4 h-4 text-gray-500" />
      <span className="text-sm font-medium text-gray-600">{title}</span>
    </div>
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm border">
      <code>{typeof children === 'string' ? children : JSON.stringify(children, null, 2)}</code>
    </pre>
  </div>
);

const FieldBadge = ({ required }) => (
  required ? (
    <Badge variant="destructive" className="text-xs ml-2">obrigatório</Badge>
  ) : (
    <Badge variant="secondary" className="text-xs ml-2">opcional</Badge>
  )
);

const EndpointSection = ({ endpoint }) => (
  <div className="border rounded-lg p-4 mb-4 bg-gray-50">
    <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
      <CheckCircle className="w-4 h-4 text-green-600" />
      {endpoint.name}
    </h4>
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <CodeBlock title="Request Body">{endpoint.request}</CodeBlock>
      </div>
      <div>
        <CodeBlock title="Response">{endpoint.response}</CodeBlock>
      </div>
    </div>
    {endpoint.description && (
      <p className="text-sm text-gray-600 mt-2 italic">{endpoint.description}</p>
    )}
  </div>
);

const entities = {
  empresa: {
    title: 'Empresa',
    description: 'Gerencia os dados das empresas/clínicas que utilizam o sistema. Cada empresa pode ter múltiplos usuários e recursos.',
    schema: {
      nome: { type: "string", required: true, description: "Nome da empresa ou pessoa física" },
      tipo_documento: { type: "string (enum)", required: false, description: "cnpj ou cpf", default: "cnpj" },
      documento: { type: "string", required: true, description: "CNPJ ou CPF da empresa" },
      email_cadastro: { type: "string (email)", required: true, description: "Email principal para contato" },
      telefone: { type: "string", required: true, description: "Telefone principal" },
      whatsapp: { type: "string", required: false, description: "WhatsApp para comunicação" },
      endereco: { type: "object", required: false, description: "Endereço completo estruturado" },
      user_id: { type: "string", required: false, description: "ID do usuário responsável/proprietário" },
      plano_id: { type: "string", required: false, description: "ID do plano de assinatura" },
      ativo: { type: "boolean", required: false, description: "Status da empresa", default: true }
    },
    endpoints: [
      {
        name: 'Empresa.create(data)',
        request: {
          nome: "Bella Estética & Bem-Estar",
          documento: "12.345.678/0001-90",
          email_cadastro: "contato@bellaestetika.com.br",
          telefone: "11987654321",
          endereco: {
            cep: "01310-100",
            rua: "Av. Paulista",
            numero: "1000",
            cidade: "São Paulo",
            uf: "SP"
          }
        },
        response: {
          id: "emp_12345",
          created_date: "2023-10-27T10:00:00Z",
          nome: "Bella Estética & Bem-Estar",
          documento: "12.345.678/0001-90",
          ativo: true
        },
        description: "Cria uma nova empresa no sistema"
      },
      {
        name: 'Empresa.filter(filters)',
        request: { ativo: true },
        response: [
          {
            id: "emp_12345",
            nome: "Bella Estética & Bem-Estar",
            documento: "12.345.678/0001-90",
            ativo: true
          }
        ],
        description: "Lista empresas com filtros opcionais"
      }
    ]
  },

  cliente: {
    title: 'Cliente',
    description: 'Gerencia todos os dados dos clientes da empresa, incluindo informações pessoais, contato e histórico.',
    schema: {
      nome: { type: "string", required: true, description: "Nome completo do cliente" },
      telefone: { type: "string", required: true, description: "Telefone principal" },
      email: { type: "string (email)", required: false, description: "Email do cliente" },
      data_nascimento: { type: "string (date)", required: false, description: "Data de nascimento" },
      endereco: { type: "object", required: false, description: "Endereço completo estruturado" },
      consentimento_lgpd: { type: "boolean", required: true, description: "Consentimento LGPD" },
      empresa_id: { type: "string", required: true, description: "ID da empresa" },
      status: { type: "string (enum)", required: false, description: "ativo ou inativo", default: "ativo" }
    },
    endpoints: [
      {
        name: 'Cliente.create(data)',
        request: {
          nome: "Maria Silva",
          telefone: "11999887766",
          email: "maria.silva@email.com",
          consentimento_lgpd: true,
          empresa_id: "emp_12345"
        },
        response: {
          id: "cli_abcde12345",
          created_date: "2023-10-27T10:00:00Z",
          nome: "Maria Silva",
          telefone: "11999887766",
          status: "ativo"
        },
        description: "Cria um novo cliente"
      },
      {
        name: 'Cliente.filter(filters)',
        request: { empresa_id: "emp_12345", status: "ativo" },
        response: [
          { id: "cli_abcde12345", nome: "Maria Silva", status: "ativo" }
        ],
        description: "Lista clientes filtrados por empresa e status"
      },
      {
        name: 'Cliente.update(id, data)',
        request: { telefone: "11888777666" },
        response: { id: "cli_abcde12345", nome: "Maria Silva", telefone: "11888777666" },
        description: "Atualiza dados de um cliente existente"
      },
      {
        name: 'Cliente.delete(id)',
        request: "cli_abcde12345",
        response: { success: true, message: "Cliente excluído com sucesso" },
        description: "Remove um cliente do sistema"
      }
    ]
  },

  profissional: {
    title: 'Profissional',
    description: 'Gerencia os dados dos profissionais que prestam serviços, incluindo especialidades e comissões.',
    schema: {
      nome: { type: "string", required: true, description: "Nome completo do profissional" },
      telefone: { type: "string", required: true, description: "Telefone do profissional" },
      email: { type: "string (email)", required: false, description: "Email do profissional" },
      especialidades: { type: "array", required: false, description: "Lista de especialidades" },
      comissao_percentual: { type: "number", required: false, description: "Percentual de comissão (0-100)" },
      empresa_id: { type: "string", required: true, description: "ID da empresa" },
      ativo: { type: "boolean", required: false, description: "Status do profissional", default: true }
    },
    endpoints: [
      {
        name: 'Profissional.create(data)',
        request: {
          nome: "Ana Santos",
          telefone: "11987654321",
          email: "ana.santos@email.com",
          especialidades: ["facial", "corporal"],
          comissao_percentual: 30,
          empresa_id: "emp_12345"
        },
        response: {
          id: "prof_xyz123",
          created_date: "2023-10-27T10:00:00Z",
          nome: "Ana Santos",
          especialidades: ["facial", "corporal"],
          ativo: true
        },
        description: "Cadastra um novo profissional"
      }
    ]
  },

  servico: {
    title: 'Serviço',
    description: 'Gerencia os serviços oferecidos pela empresa, incluindo preços e duração.',
    schema: {
      nome: { type: "string", required: true, description: "Nome do serviço" },
      preco: { type: "number", required: true, description: "Preço do serviço" },
      duracao_minutos: { type: "number", required: true, description: "Duração em minutos (min: 15)" },
      categoria: { type: "string (enum)", required: false, description: "Categoria do serviço" },
      empresa_id: { type: "string", required: true, description: "ID da empresa" },
      ativo: { type: "boolean", required: false, description: "Status do serviço", default: true }
    },
    endpoints: [
      {
        name: 'Servico.create(data)',
        request: {
          nome: "Limpeza de Pele",
          preco: 120.00,
          duracao_minutos: 60,
          categoria: "facial",
          empresa_id: "emp_12345"
        },
        response: {
          id: "serv_abc456",
          created_date: "2023-10-27T10:00:00Z",
          nome: "Limpeza de Pele",
          preco: 120.00,
          ativo: true
        },
        description: "Cadastra um novo serviço"
      }
    ]
  },

  agendamento: {
    title: 'Agendamento',
    description: 'Gerencia os agendamentos entre clientes e profissionais para serviços específicos.',
    schema: {
      cliente_id: { type: "string", required: true, description: "ID do cliente" },
      profissional_id: { type: "string", required: true, description: "ID do profissional" },
      servico_id: { type: "string", required: true, description: "ID do serviço" },
      data_hora: { type: "string (date-time)", required: true, description: "Data e hora do agendamento" },
      valor_total: { type: "number", required: true, description: "Valor total do agendamento" },
      status: { type: "string (enum)", required: false, description: "Status do agendamento", default: "agendado" },
      empresa_id: { type: "string", required: true, description: "ID da empresa" }
    },
    endpoints: [
      {
        name: 'Agendamento.create(data)',
        request: {
          cliente_id: "cli_abcde12345",
          profissional_id: "prof_xyz123",
          servico_id: "serv_abc456",
          data_hora: "2023-11-15T14:00:00Z",
          valor_total: 120.00,
          empresa_id: "emp_12345"
        },
        response: {
          id: "agend_789def",
          created_date: "2023-10-27T10:00:00Z",
          data_hora: "2023-11-15T14:00:00Z",
          status: "agendado"
        },
        description: "Cria um novo agendamento"
      }
    ]
  },

  produto: {
    title: 'Produto',
    description: 'Gerencia o estoque de produtos, incluindo preços, quantidades e categorias.',
    schema: {
      nome: { type: "string", required: true, description: "Nome do produto" },
      quantidade_estoque: { type: "number", required: true, description: "Quantidade em estoque (min: 0)" },
      empresa_id: { type: "string", required: true, description: "ID da empresa" },
      categoria: { type: "string (enum)", required: false, description: "Categoria do produto" },
      preco_custo: { type: "number", required: false, description: "Preço de custo" },
      preco_venda: { type: "number", required: false, description: "Preço de venda" },
      ativo: { type: "boolean", required: false, description: "Status do produto", default: true }
    },
    endpoints: [
      {
        name: 'Produto.create(data)',
        request: {
          nome: "Creme Hidratante Facial",
          quantidade_estoque: 50,
          preco_custo: 25.00,
          preco_venda: 49.90,
          categoria: "creme_facial",
          empresa_id: "emp_12345"
        },
        response: {
          id: "prod_ghi789",
          created_date: "2023-10-27T10:00:00Z",
          nome: "Creme Hidratante Facial",
          quantidade_estoque: 50
        },
        description: "Cadastra um novo produto"
      }
    ]
  },

  venda: {
    title: 'Venda',
    description: 'Registra as vendas realizadas, incluindo itens, valores e formas de pagamento.',
    schema: {
      cliente_id: { type: "string", required: true, description: "ID do cliente" },
      profissional_id: { type: "string", required: true, description: "ID do profissional responsável" },
      tipo: { type: "string (enum)", required: true, description: "Tipo da venda (servico, produto, combo)" },
      valor_total: { type: "number", required: true, description: "Valor total da venda (min: 0)" },
      forma_pagamento: { type: "string (enum)", required: true, description: "Forma de pagamento" },
      empresa_id: { type: "string", required: true, description: "ID da empresa" },
      itens: { type: "array", required: false, description: "Itens da venda" },
      desconto: { type: "number", required: false, description: "Desconto aplicado", default: 0 }
    },
    endpoints: [
      {
        name: 'Venda.create(data)',
        request: {
          cliente_id: "cli_abcde12345",
          profissional_id: "prof_xyz123",
          tipo: "servico",
          valor_total: 120.00,
          forma_pagamento: "cartao_credito",
          empresa_id: "emp_12345"
        },
        response: {
          id: "venda_jkl012",
          created_date: "2023-10-27T10:00:00Z",
          valor_total: 120.00,
          forma_pagamento: "cartao_credito"
        },
        description: "Registra uma nova venda"
      }
    ]
  },

  movimentacaoEstoque: {
    title: 'Movimentação de Estoque',
    description: 'Registra todas as movimentações de entrada, saída e ajustes no estoque de produtos.',
    schema: {
      produto_id: { type: "string", required: true, description: "ID do produto" },
      tipo: { type: "string (enum)", required: true, description: "Tipo da movimentação" },
      quantidade: { type: "number", required: true, description: "Quantidade movimentada (min: 0)" },
      quantidade_anterior: { type: "number", required: true, description: "Quantidade antes da movimentação" },
      quantidade_atual: { type: "number", required: true, description: "Quantidade após a movimentação" },
      empresa_id: { type: "string", required: true, description: "ID da empresa" },
      motivo: { type: "string", required: false, description: "Motivo da movimentação" }
    },
    endpoints: [
      {
        name: 'MovimentacaoEstoque.create(data)',
        request: {
          produto_id: "prod_ghi789",
          tipo: "entrada",
          quantidade: 20,
          quantidade_anterior: 30,
          quantidade_atual: 50,
          motivo: "Compra de fornecedor",
          empresa_id: "emp_12345"
        },
        response: {
          id: "mov_mno345",
          created_date: "2023-10-27T10:00:00Z",
          tipo: "entrada",
          quantidade: 20
        },
        description: "Registra uma movimentação de estoque"
      }
    ]
  },

  plano: {
    title: 'Plano',
    description: 'Gerencia os planos de assinatura disponíveis para as empresas (módulo Super Admin).',
    schema: {
      nome: { type: "string", required: true, description: "Nome do plano (ex: Básico, Premium)" },
      valor_mensal: { type: "number", required: true, description: "Valor da mensalidade (min: 0)" },
      descricao: { type: "string", required: false, description: "Descrição do que o plano inclui" },
      recursos: { type: "array", required: false, description: "Lista de recursos incluídos" },
      ativo: { type: "boolean", required: false, description: "Se o plano está ativo", default: true }
    },
    endpoints: [
      {
        name: 'Plano.create(data)',
        request: {
          nome: "Plano Premium",
          valor_mensal: 99.90,
          descricao: "Plano completo com todos os recursos",
          recursos: ["Agenda ilimitada", "Relatórios avançados", "Suporte prioritário"]
        },
        response: {
          id: "plano_pqr678",
          created_date: "2023-10-27T10:00:00Z",
          nome: "Plano Premium",
          valor_mensal: 99.90
        },
        description: "Cria um novo plano de assinatura"
      }
    ]
  },

  cobranca: {
    title: 'Cobrança',
    description: 'Gerencia as cobranças/faturas das empresas pelos planos contratados (módulo Super Admin).',
    schema: {
      empresa_id: { type: "string", required: true, description: "ID da empresa sendo cobrada" },
      valor: { type: "number", required: true, description: "Valor da cobrança (min: 0)" },
      data_vencimento: { type: "string (date)", required: true, description: "Data de vencimento" },
      plano_id: { type: "string", required: false, description: "ID do plano referente à cobrança" },
      status: { type: "string (enum)", required: false, description: "Status da cobrança", default: "pendente" }
    },
    endpoints: [
      {
        name: 'Cobranca.create(data)',
        request: {
          empresa_id: "emp_12345",
          plano_id: "plano_pqr678",
          valor: 99.90,
          data_vencimento: "2023-11-30"
        },
        response: {
          id: "cob_stu901",
          created_date: "2023-10-27T10:00:00Z",
          valor: 99.90,
          status: "pendente"
        },
        description: "Gera uma nova cobrança"
      }
    ]
  },

  user: {
    title: 'User (Usuário)',
    description: 'Entidade built-in do Base44. Gerencia dados adicionais dos usuários do sistema.',
    schema: {
      id: { type: "string", required: false, description: "ID único (built-in)" },
      full_name: { type: "string", required: false, description: "Nome completo (built-in)" },
      email: { type: "string", required: false, description: "Email (built-in)" },
      role: { type: "string", required: false, description: "admin ou user (built-in)" },
      foto_perfil: { type: "string", required: false, description: "URL da foto de perfil" },
      empresa_id: { type: "string", required: false, description: "ID da empresa do usuário" },
      ativo: { type: "boolean", required: false, description: "Status do usuário", default: true }
    },
    endpoints: [
      {
        name: 'User.me()',
        request: "Sem parâmetros",
        response: {
          id: "user_vwx234",
          full_name: "João Silva",
          email: "joao@email.com",
          role: "user",
          empresa_id: "emp_12345"
        },
        description: "Retorna dados do usuário atual logado"
      },
      {
        name: 'User.updateMyUserData(data)',
        request: {
          foto_perfil: "https://exemplo.com/foto.jpg",
          empresa_id: "emp_12345"
        },
        response: {
          id: "user_vwx234",
          foto_perfil: "https://exemplo.com/foto.jpg",
          empresa_id: "emp_12345"
        },
        description: "Atualiza dados do usuário atual"
      }
    ]
  }
};

export default function Documentacao() {
  const exportarPDF = () => {
    // Criar uma nova janela com o conteúdo otimizado para impressão
    const printWindow = window.open('', '_blank');
    const documentacao = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Documentação da API - BellaGest</title>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 1200px;
              margin: 0 auto;
              padding: 20px;
            }
            h1 {
              color: #2563eb;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 10px;
              margin-bottom: 30px;
            }
            h2 {
              color: #1f2937;
              margin-top: 40px;
              margin-bottom: 20px;
              page-break-after: avoid;
            }
            h3 {
              color: #374151;
              margin-top: 30px;
              margin-bottom: 15px;
            }
            h4 {
              color: #4b5563;
              margin-top: 25px;
              margin-bottom: 10px;
            }
            .entity-section {
              page-break-inside: avoid;
              margin-bottom: 50px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 20px;
            }
            .schema-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            .schema-table th,
            .schema-table td {
              border: 1px solid #d1d5db;
              padding: 10px;
              text-align: left;
            }
            .schema-table th {
              background-color: #f3f4f6;
              font-weight: 600;
            }
            .code-block {
              background-color: #1f2937;
              color: #f9fafb;
              padding: 15px;
              border-radius: 6px;
              overflow-x: auto;
              margin: 10px 0;
              font-family: 'Monaco', 'Consolas', monospace;
              font-size: 12px;
              white-space: pre-wrap; /* Ensures long lines wrap */
            }
            .endpoint-section {
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 15px;
              margin: 20px 0;
              page-break-inside: avoid;
            }
            .endpoint-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-top: 10px;
            }
            @media print {
              .entity-section {
                page-break-inside: avoid;
                break-inside: avoid;
              }
              .endpoint-section {
                page-break-inside: avoid;
                break-inside: avoid;
              }
            }
            .required {
              color: #dc2626;
              font-weight: 600;
            }
            .optional {
              color: #6b7280;
            }
            .description {
              font-style: italic;
              color: #6b7280;
              margin-top: 5px;
            }
          </style>
        </head>
        <body>
          <h1>📚 Documentação da API - BellaGest</h1>
          <p><strong>Sistema de Gestão de Clínicas de Beleza e Estética</strong></p>
          <p>Referência completa das entidades e endpoints do sistema BellaGest.</p>
          <p><em>Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</em></p>
          
          ${Object.entries(entities).map(([key, entity]) => `
            <div class="entity-section">
              <h2>🗂️ ${entity.title}</h2>
              <p>${entity.description}</p>
              
              <h3>📋 Schema da Entidade</h3>
              <table class="schema-table">
                <thead>
                  <tr>
                    <th>Campo</th>
                    <th>Tipo</th>
                    <th>Obrigatório</th>
                    <th>Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries(entity.schema).map(([fieldName, fieldInfo]) => `
                    <tr>
                      <td><code>${fieldName}</code></td>
                      <td>${fieldInfo.type}</td>
                      <td class="${fieldInfo.required ? 'required' : 'optional'}">
                        ${fieldInfo.required ? 'Sim' : 'Não'}
                      </td>
                      <td>
                        ${fieldInfo.description}
                        ${fieldInfo.default !== undefined ? `<br><small>Padrão: ${String(fieldInfo.default)}</small>` : ''}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              ${entity.endpoints && entity.endpoints.length > 0 ? `
                <h3>🔧 Endpoints da API (SDK)</h3>
                ${entity.endpoints.map(endpoint => `
                  <div class="endpoint-section">
                    <h4>✅ ${endpoint.name}</h4>
                    ${endpoint.description ? `<p class="description">${endpoint.description}</p>` : ''}
                    
                    <div class="endpoint-grid">
                      <div>
                        <strong>Request Body:</strong>
                        <div class="code-block">${typeof endpoint.request === 'string' ? endpoint.request : JSON.stringify(endpoint.request, null, 2)}</div>
                      </div>
                      <div>
                        <strong>Response:</strong>
                        <div class="code-block">${typeof endpoint.response === 'string' ? endpoint.response : JSON.stringify(endpoint.response, null, 2)}</div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              ` : ''}
            </div>
          `).join('')}
          
          <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p><small>Esta documentação é gerada automaticamente com base no schema das entidades.</small></p>
            <p><small>© ${new Date().getFullYear()} BellaGest - Sistema de Gestão de Clínicas de Beleza</small></p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(documentacao);
    printWindow.document.close();
    
    // Aguardar o carregamento e então abrir o diálogo de impressão
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Fechar a janela após a impressão (opcional)
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      }, 500); // Small delay to ensure content is rendered before print dialog
    };
  };

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Documentação da API
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Referência completa das entidades e endpoints do sistema BellaGest. 
            Cada módulo contém descrição, schema dos campos e exemplos de uso da API.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-blue-600 font-medium">
                {Object.keys(entities).length} Entidades Documentadas
              </span>
            </div>
            <Button 
              onClick={exportarPDF}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </header>

        <Card className="glass-effect border-0 shadow-xl">
          <CardContent className="p-0">
            <Accordion type="single" collapsible className="w-full">
              {Object.entries(entities).map(([key, entity]) => (
                <AccordionItem key={key} value={key} className="border-b border-gray-100 last:border-0">
                  <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 text-left">
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-lg font-semibold text-gray-800">{entity.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{entity.description}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {entity.endpoints?.length || 0} endpoints
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="space-y-6">
                      {/* Schema Section */}
                      <div>
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          Schema da Entidade
                        </h4>
                        <div className="bg-white rounded-lg border p-4">
                          <div className="space-y-3">
                            {Object.entries(entity.schema).map(([fieldName, fieldInfo]) => (
                              <div key={fieldName} className="flex items-start justify-between border-b border-gray-100 pb-2 last:border-0">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-blue-600">
                                      {fieldName}
                                    </code>
                                    <FieldBadge required={fieldInfo.required} />
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">{fieldInfo.description}</p>
                                  {fieldInfo.default !== undefined && (
                                    <p className="text-xs text-green-600 mt-1">Padrão: {String(fieldInfo.default)}</p>
                                  )}
                                </div>
                                <Badge variant="outline" className="text-xs ml-4">
                                  {fieldInfo.type}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Endpoints Section */}
                      {entity.endpoints && entity.endpoints.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Code className="w-4 h-4 text-green-500" />
                            Endpoints da API (SDK)
                          </h4>
                          <div className="space-y-4">
                            {entity.endpoints.map((endpoint, index) => (
                              <EndpointSection key={index} endpoint={endpoint} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Esta documentação é gerada automaticamente com base no schema das entidades.
            <br />
            Para mais informações sobre o SDK do Base44, consulte a documentação oficial.
          </p>
        </div>
      </div>
    </div>
  );
}
