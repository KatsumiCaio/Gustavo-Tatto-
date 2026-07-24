export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
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

export interface Anamnese {
  id: string;
  clienteId?: string;
  clienteNome: string;
  clienteTelefone?: string;
  data: string; // yyyy-MM-dd
  alergias: {
    possuiAlergia: boolean;
    latex: boolean;
    tintas: boolean;
    pomadas: boolean;
    detalhes?: string;
  };
  condicoesPele: {
    keloidOuCicatriz: boolean;
    psoriaseDermatite: boolean;
    manchasOuSinais: boolean;
    detalhes?: string;
  };
  medicamentos: {
    usaAnticoagulante: boolean;
    usaRoacutan: boolean;
    usaAntibiotico: boolean;
    detalhes?: string;
  };
  saudeGeral: {
    diabetes: boolean;
    hipertensao: boolean;
    cardiopatia: boolean;
    epilepsia: boolean;
    gestanteOuLactante: boolean;
    hepatiteOuHiv: boolean;
    consumiuAlcool24h: boolean;
    outrasCondicoes?: string;
  };
  confirmadoPeloCliente: boolean;
  observacoes?: string;
}

export interface FlashArt {
  id: string;
  titulo: string;
  estilo: string;
  tamanhoCm: string;
  preco: number;
  status: 'disponivel' | 'reservado' | 'vendido';
  imagem: string;
  descricao?: string;
  clienteReservado?: string;
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
  | 'anamnese'
  | 'flashes';

export interface NavigationParams {
  tatuagemId?: string;
  clienteNome?: string;
  clienteId?: string;
  tab?: 'anamnese' | 'cuidados' | 'historico';
  flashId?: string;
}
