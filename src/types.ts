export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  instagram?: string;
  observacoes?: string;
}

export interface Tatuagem {
  id: string;
  cliente: string;
  descricao: string;
  data: string; // yyyy-MM-dd
  horario: string; // HH:mm
  local: string;
  valor: number;
  status: 'agendado' | 'concluído' | 'cancelado';
  telefone?: string;
  observacoes?: string;
  imagemModelo?: string; // base64 or URL
  imagemFinal?: string;  // base64 or URL
}

export type ViewMode = 'dia' | 'semana' | 'mes';

export type ScreenName =
  | 'main'
  | 'agenda'
  | 'add_tatuagem'
  | 'cadastro_cliente'
  | 'lista_clientes'
  | 'historico_trabalhos'
  | 'settings';

export interface NavigationParams {
  tatuagemId?: string;
  clienteNome?: string;
  clienteId?: string;
}
