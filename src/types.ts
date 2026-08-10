export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  instagram?: string;
  observacoes?: string;
}

export interface Notificacao {
  id: string;
  tatuagemId: string;
  cliente: string;
  descricao: string;
  dataTatuagem: string; // yyyy-MM-dd
  horarioTatuagem: string; // HH:mm
  dataHoraNotificacao: string; // YYYY-MM-DD HH:mm for sorting and status
  opcaoLembrete: string; // 'mesmo_horario' | '15min' | '30min' | '1hora' | '2horas' | '1dia' | 'personalizado'
  mensagem: string;
  lida: boolean;
  criadaEm: string;
}

export interface Tatuagem {
  id: string;
  cliente: string;
  descricao: string;
  data: string; // yyyy-MM-dd
  horario: string; // HH:mm (horário de início)
  horarioTermino?: string; // HH:mm (horário de término)
  local: string;
  valor: number;
  status: 'agendado' | 'concluído' | 'cancelado';
  telefone?: string;
  observacoes?: string;
  imagemModelo?: string; // base64 or URL (Referência / Modelo)
  imagemFinal?: string;  // base64 or URL (Recém-Feita)
  fotoDecalque?: string; // base64 or URL (Decalque / Stencil)
  fotoRecemFeita?: string; // base64 or URL (Tattoo Recém-Feita)
  fotoCicatrizada?: string; // base64 or URL (Tattoo Cicatrizada)

  // Notification fields
  notificacaoAtivar?: boolean;
  notificacaoOpcao?: 'mesmo_horario' | '15min' | '30min' | '1hora' | '2horas' | '1dia' | 'personalizado';
  notificacaoHorarioPersonalizado?: string; // HH:mm
  notificacaoDataPersonalizada?: string; // yyyy-MM-dd
}

export type ViewMode = 'dia' | 'semana' | 'mes';

export type ScreenName =
  | 'main'
  | 'agenda'
  | 'add_tatuagem'
  | 'cadastro_cliente'
  | 'lista_clientes'
  | 'historico_trabalhos'
  | 'settings'
  | 'notificacoes'
  | 'faturamento';

export interface NavigationParams {
  tatuagemId?: string;
  clienteNome?: string;
  clienteId?: string;
}
