import React, { useState } from 'react';
import { useAgenda } from '../contexts/AgendaContext';
import { FlashArt, Cliente } from '../types';
import {
  Sparkles,
  Plus,
  Search,
  Filter,
  DollarSign,
  Maximize2,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  UserCheck,
  MessageSquare,
  X,
  Upload,
  Image as ImageIcon,
  Ruler,
  Tag,
  Eye,
  Calendar,
  Share2,
  Zap,
  Info
} from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';

const ESTILOS_PRESET = [
  'Blackwork',
  'Fine Line',
  'Neotradicional',
  'Old School',
  'Oriental',
  'Minimalista',
  'Realismo',
  'Colorido',
  'Geometrico',
  'Outro',
];

const PRESET_IMAGES = [
  { label: 'Cobra Blackwork', url: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=600&q=80' },
  { label: 'Rosa Fine Line', url: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=600&q=80' },
  { label: 'Tigre Oriental', url: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=600&q=80' },
  { label: 'Barco Old School', url: 'https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&w=600&q=80' },
  { label: 'Lobo Geométrico', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80' },
];

export const FlashesGalleryScreen: React.FC = () => {
  const { flashes, clientes, addFlash, updateFlash, deleteFlash, navigate } = useAgenda();

  // Filters & View Mode
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'disponivel' | 'reservado' | 'vendido'>('todos');
  const [styleFilter, setStyleFilter] = useState<string>('todos');
  const [presentationMode, setPresentationMode] = useState(false);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFlash, setEditingFlash] = useState<FlashArt | null>(null);
  const [viewingFlash, setViewingFlash] = useState<FlashArt | null>(null);
  const [deletingFlashId, setDeletingFlashId] = useState<string | null>(null);
  const [reservingFlash, setReservingFlash] = useState<FlashArt | null>(null);

  // Reserve Form State
  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [reserveClienteNome, setReserveClienteNome] = useState('');

  // Form State
  const [titulo, setTitulo] = useState('');
  const [estilo, setEstilo] = useState('Blackwork');
  const [tamanhoCm, setTamanhoCm] = useState('10 x 8 cm');
  const [preco, setPreco] = useState('');
  const [status, setStatus] = useState<'disponivel' | 'reservado' | 'vendido'>('disponivel');
  const [imagem, setImagem] = useState('');
  const [descricao, setDescricao] = useState('');
  const [clienteReservado, setClienteReservado] = useState('');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleOpenAddModal = () => {
    setEditingFlash(null);
    setTitulo('');
    setEstilo('Blackwork');
    setTamanhoCm('10 x 8 cm');
    setPreco('');
    setStatus('disponivel');
    setImagem(PRESET_IMAGES[0].url);
    setDescricao('');
    setClienteReservado('');
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (flash: FlashArt) => {
    setEditingFlash(flash);
    setTitulo(flash.titulo);
    setEstilo(flash.estilo);
    setTamanhoCm(flash.tamanhoCm);
    setPreco(flash.preco.toString());
    setStatus(flash.status);
    setImagem(flash.imagem);
    setDescricao(flash.descricao || '');
    setClienteReservado(flash.clienteReservado || '');
    setIsFormOpen(true);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagem(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveFlash = (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim()) {
      alert('Por favor, informe o título do flash.');
      return;
    }

    if (!imagem) {
      alert('Por favor, insira ou selecione uma imagem para o flash.');
      return;
    }

    const priceNum = parseFloat(preco.replace(',', '.')) || 0;

    if (editingFlash) {
      updateFlash(editingFlash.id, {
        titulo: titulo.trim(),
        estilo,
        tamanhoCm: tamanhoCm.trim() || 'Sob consulta',
        preco: priceNum,
        status,
        imagem,
        descricao: descricao.trim() || undefined,
        clienteReservado: status === 'reservado' ? clienteReservado.trim() || undefined : undefined,
      });
    } else {
      addFlash({
        titulo: titulo.trim(),
        estilo,
        tamanhoCm: tamanhoCm.trim() || 'Sob consulta',
        preco: priceNum,
        status,
        imagem,
        descricao: descricao.trim() || undefined,
        clienteReservado: status === 'reservado' ? clienteReservado.trim() || undefined : undefined,
      });
    }

    setIsFormOpen(false);
  };

  const handleConfirmReservation = () => {
    if (!reservingFlash) return;

    const nome = reserveClienteNome.trim();
    if (!nome) {
      alert('Informe o nome do cliente para a reserva.');
      return;
    }

    updateFlash(reservingFlash.id, {
      status: 'reservado',
      clienteReservado: nome,
    });

    const shouldSchedule = window.confirm(
      `Flash reservado para ${nome}!\nDeseja ir direto para a tela de Agendamento para criar o horário no calendário?`
    );

    if (shouldSchedule) {
      navigate('add_tatuagem', {
        clienteNome: nome,
      });
    }

    setReservingFlash(null);
    setReserveClienteNome('');
    setSelectedClienteId('');
  };

  const handleSendFlashWhatsApp = (flash: FlashArt) => {
    let msg = `🎨 *PROJETO DE TATUAGEM DISPONÍVEL - STUDIO GUSTAVO TATTOO*\n\n`;
    msg += `✨ *${flash.titulo}*\n`;
    msg += `📐 *Tamanho Estimado:* ${flash.tamanhoCm}\n`;
    msg += `🎨 *Estilo:* ${flash.estilo}\n`;
    msg += `💰 *Valor:* ${formatCurrency(flash.preco)}\n`;
    msg += `📌 *Status:* ${flash.status === 'disponivel' ? '🟢 Disponível para Tatuar' : '🟡 Reservado'}\n\n`;
    if (flash.descricao) {
      msg += `📝 *Detalhes:* ${flash.descricao}\n\n`;
    }
    msg += `Gostou desse projeto? Responda este WhatsApp para agendarmos sua sessão! ✍️🔥`;

    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Filtering list
  const filteredFlashes = flashes.filter(f => {
    const matchesSearch =
      f.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.estilo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.descricao && f.descricao.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'todos' || f.status === statusFilter;
    const matchesStyle = styleFilter === 'todos' || f.estilo === styleFilter;

    return matchesSearch && matchesStatus && matchesStyle;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#2D2D2D] via-[#262626] to-[#1C1C1C] p-5 sm:p-6 rounded-3xl border border-[#3A3A3A] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B35]/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]/30 px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles size={14} /> Galeria de Flashes Exclusivos
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#F5F5F5] tracking-tight">
            Projetos & Flashes Disponíveis
          </h2>
          <p className="text-xs sm:text-sm text-[#999999] max-w-xl">
            Apresente seus desenhos aos clientes no estúdio, gerencie preços, tamanhos e reservas exclusivas.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2">
          {/* Toggle Presentation Mode */}
          <button
            onClick={() => setPresentationMode(!presentationMode)}
            className={`inline-flex items-center gap-2 font-bold text-xs py-3 px-4 rounded-2xl border transition-all shadow-lg ${
              presentationMode
                ? 'bg-[#FFB703] text-black border-[#FFB703]'
                : 'bg-[#1C1C1C] text-[#F5F5F5] border-[#3A3A3A] hover:bg-[#333333]'
            }`}
            title="Ativar modo vitrine para mostrar no tablet/celular ao cliente"
          >
            <Eye size={16} />
            <span>{presentationMode ? 'Modo Apresentação ON' : 'Modo Vitrine Estúdio'}</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 bg-[#FF6B35] hover:bg-[#E85D2A] text-white font-bold text-xs py-3 px-5 rounded-2xl transition-all shadow-xl active:scale-95"
          >
            <Plus size={18} />
            <span>Cadastrar Flash</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#2D2D2D] border border-[#3A3A3A] p-4 rounded-2xl shadow-lg space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <Search size={18} className="absolute left-3.5 top-3.5 text-[#999999]" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, estilo ou observação..."
              className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F5F5F5] focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl p-2.5 text-xs text-[#F5F5F5] focus:outline-none"
            >
              <option value="todos">Todos os Status</option>
              <option value="disponivel">🟢 Disponíveis</option>
              <option value="reservado">🟡 Reservados</option>
              <option value="vendido">🔴 Vendidos / Indisponíveis</option>
            </select>
          </div>

          {/* Style Filter */}
          <div className="sm:col-span-4">
            <select
              value={styleFilter}
              onChange={e => setStyleFilter(e.target.value)}
              className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl p-2.5 text-xs text-[#F5F5F5] focus:outline-none"
            >
              <option value="todos">Todos os Estilos</option>
              {ESTILOS_PRESET.map(st => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Style Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          <span className="text-[11px] text-[#888888] font-bold uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter size={12} /> Estilos:
          </span>
          <button
            onClick={() => setStyleFilter('todos')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
              styleFilter === 'todos'
                ? 'bg-[#FF6B35] text-white'
                : 'bg-[#1C1C1C] text-[#999999] hover:text-white hover:bg-[#3A3A3A]'
            }`}
          >
            Todos
          </button>
          {ESTILOS_PRESET.map(s => (
            <button
              key={s}
              onClick={() => setStyleFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
                styleFilter === s
                  ? 'bg-[#FF6B35] text-white'
                  : 'bg-[#1C1C1C] text-[#999999] hover:text-white hover:bg-[#3A3A3A]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Flash Cards */}
      {filteredFlashes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredFlashes.map(flash => {
            const isAvailable = flash.status === 'disponivel';
            const isReserved = flash.status === 'reservado';

            return (
              <div
                key={flash.id}
                className="bg-[#2D2D2D] border border-[#3A3A3A] hover:border-[#FF6B35]/50 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Image Container */}
                <div
                  onClick={() => setViewingFlash(flash)}
                  className="relative aspect-square bg-[#1C1C1C] overflow-hidden cursor-pointer group-hover:brightness-105 transition-all"
                >
                  <img
                    src={flash.imagem}
                    alt={flash.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Status Overlay Badge */}
                  <div className="absolute top-3 left-3">
                    {isAvailable && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold bg-[#25D366] text-black px-3 py-1 rounded-full shadow-lg">
                        <CheckCircle2 size={12} /> Disponível
                      </span>
                    )}
                    {isReserved && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold bg-[#FFB703] text-black px-3 py-1 rounded-full shadow-lg">
                        <Clock size={12} /> Reservado
                      </span>
                    )}
                    {!isAvailable && !isReserved && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold bg-[#666666] text-white px-3 py-1 rounded-full shadow-lg">
                        Vendido
                      </span>
                    )}
                  </div>

                  {/* Zoom Hint Icon */}
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md p-2 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 size={16} />
                  </div>

                  {/* Style Tag Badge */}
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#FF6B35] border border-[#FF6B35]/30">
                    {flash.estilo}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-[#F5F5F5] group-hover:text-[#FF6B35] transition-colors line-clamp-1">
                      {flash.titulo}
                    </h3>

                    {flash.descricao && (
                      <p className="text-xs text-[#999999] mt-1 line-clamp-2 leading-relaxed">
                        {flash.descricao}
                      </p>
                    )}

                    {isReserved && flash.clienteReservado && (
                      <div className="mt-2 bg-[#FFB703]/10 border border-[#FFB703]/20 px-2.5 py-1 rounded-lg text-[11px] text-[#FFB703] font-medium flex items-center gap-1.5">
                        <UserCheck size={13} />
                        <span>Reservado para: <strong>{flash.clienteReservado}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Metadata Row: Size & Price */}
                  <div className="pt-2 border-t border-[#3A3A3A] flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-[#999999]">
                      <Ruler size={14} className="text-[#888888]" />
                      <span>{flash.tamanhoCm}</span>
                    </div>

                    <div className="text-base font-black text-[#FF6B35]">
                      {formatCurrency(flash.preco)}
                    </div>
                  </div>

                  {/* Action Buttons (Hidden if in presentation mode) */}
                  {!presentationMode && (
                    <div className="pt-2 flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1">
                        {isAvailable && (
                          <button
                            onClick={() => {
                              setReservingFlash(flash);
                              setReserveClienteNome('');
                            }}
                            className="bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                            title="Reservar para Cliente"
                          >
                            <UserCheck size={14} />
                            <span>Reservar</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleSendFlashWhatsApp(flash)}
                          className="bg-[#1C1C1C] hover:bg-[#3A3A3A] text-[#25D366] border border-[#3A3A3A] p-1.5 rounded-xl transition-colors"
                          title="Compartilhar no WhatsApp"
                        >
                          <MessageSquare size={15} />
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(flash)}
                          className="bg-[#1C1C1C] hover:bg-[#3A3A3A] text-[#999999] hover:text-white border border-[#3A3A3A] p-1.5 rounded-xl transition-colors"
                          title="Editar Flash"
                        >
                          <Edit2 size={15} />
                        </button>
                      </div>

                      <button
                        onClick={() => setDeletingFlashId(flash.id)}
                        className="bg-[#1C1C1C] hover:bg-[#E63946]/20 text-[#999999] hover:text-[#E63946] border border-[#3A3A3A] p-1.5 rounded-xl transition-colors"
                        title="Excluir Flash"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#2D2D2D] border border-[#3A3A3A] rounded-3xl p-12 text-center space-y-3">
          <div className="w-16 h-16 bg-[#FF6B35]/10 rounded-2xl flex items-center justify-center text-[#FF6B35] mx-auto">
            <Sparkles size={32} />
          </div>
          <h3 className="text-lg font-bold text-[#F5F5F5]">Nenhum projeto encontrado</h3>
          <p className="text-xs text-[#999999] max-w-sm mx-auto">
            Não há flashes cadastrados com os filtros atuais. Cadastre novos desenhos para montar seu portfólio disponível no estúdio!
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 bg-[#FF6B35] hover:bg-[#E85D2A] text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-lg mt-2"
          >
            <Plus size={16} />
            <span>Cadastrar Primeiro Flash</span>
          </button>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT FLASH FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#2D2D2D] border border-[#3A3A3A] w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#3A3A3A] pb-3">
              <div className="flex items-center gap-2 text-lg font-bold text-[#F5F5F5]">
                <Sparkles className="text-[#FF6B35]" size={22} />
                <h3>{editingFlash ? 'Editar Flash / Projeto' : 'Cadastrar Novo Flash'}</h3>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-[#999999] hover:text-white p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveFlash} className="space-y-4">
              {/* Image Input Selection */}
              <div className="space-y-2">
                <label className="block text-xs text-[#999999] font-medium">
                  Imagem do Desenho / Flash *
                </label>

                {imagem ? (
                  <div className="relative aspect-video bg-[#1C1C1C] rounded-2xl overflow-hidden border border-[#3A3A3A]">
                    <img src={imagem} alt="Preview" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setImagem('')}
                      className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg"
                      title="Remover Imagem"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-[#3A3A3A] hover:border-[#FF6B35] rounded-2xl p-6 text-center bg-[#1C1C1C] space-y-3 transition-colors">
                    <Upload size={28} className="mx-auto text-[#FF6B35]" />
                    <p className="text-xs text-[#999999]">
                      Arraste ou selecione a imagem do seu desenho (PNG, JPG ou WEBP)
                    </p>
                    <label className="inline-flex items-center gap-2 bg-[#3A3A3A] hover:bg-[#4A4A4A] text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer transition-colors">
                      <ImageIcon size={14} />
                      <span>Carregar do Aparelho</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {/* Preset Images Bar */}
                <div className="pt-1">
                  <span className="text-[11px] text-[#888888] font-bold block mb-1.5">
                    Ou selecione um exemplo para testes:
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {PRESET_IMAGES.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setImagem(preset.url)}
                        className="flex-shrink-0 bg-[#1C1C1C] border border-[#3A3A3A] hover:border-[#FF6B35] rounded-xl p-1.5 text-[10px] text-[#999999] hover:text-white flex items-center gap-1.5"
                      >
                        <img src={preset.url} alt={preset.label} className="w-6 h-6 rounded-lg object-cover" />
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Title & Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#999999] font-medium mb-1">
                    Título / Nome da Arte *
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={e => setTitulo(e.target.value)}
                    placeholder="Ex: Cobra Imperial & Adaga"
                    required
                    className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl p-2.5 text-xs text-[#F5F5F5] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#999999] font-medium mb-1">Estilo *</label>
                  <select
                    value={estilo}
                    onChange={e => setEstilo(e.target.value)}
                    className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl p-2.5 text-xs text-[#F5F5F5] focus:outline-none"
                  >
                    {ESTILOS_PRESET.map(st => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Size & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#999999] font-medium mb-1">
                    Tamanho Estimado (cm)
                  </label>
                  <input
                    type="text"
                    value={tamanhoCm}
                    onChange={e => setTamanhoCm(e.target.value)}
                    placeholder="Ex: 12 x 8 cm"
                    className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl p-2.5 text-xs text-[#F5F5F5] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#999999] font-medium mb-1">
                    Preço Estimado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={preco}
                    onChange={e => setPreco(e.target.value)}
                    placeholder="Ex: 450.00"
                    className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl p-2.5 text-xs text-[#F5F5F5] focus:outline-none"
                  />
                </div>
              </div>

              {/* Status & Client */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#999999] font-medium mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl p-2.5 text-xs text-[#F5F5F5] focus:outline-none"
                  >
                    <option value="disponivel">🟢 Disponível</option>
                    <option value="reservado">🟡 Reservado</option>
                    <option value="vendido">🔴 Vendido / Indisponível</option>
                  </select>
                </div>

                {status === 'reservado' && (
                  <div>
                    <label className="block text-xs text-[#999999] font-medium mb-1">
                      Cliente Reservado
                    </label>
                    <input
                      type="text"
                      value={clienteReservado}
                      onChange={e => setClienteReservado(e.target.value)}
                      placeholder="Nome do cliente"
                      className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl p-2.5 text-xs text-[#F5F5F5] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Description / Details */}
              <div>
                <label className="block text-xs text-[#999999] font-medium mb-1">
                  Observações / Detalhes do Projeto
                </label>
                <textarea
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  placeholder="Ex: Pode ser adaptado para braço ou perna. Exige 1 sessão de aproximadamente 3h."
                  rows={2}
                  className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl p-2.5 text-xs text-[#F5F5F5] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#3A3A3A]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-[#1C1C1C] hover:bg-[#3A3A3A] text-[#999999] hover:text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="bg-[#FF6B35] hover:bg-[#E85D2A] text-white font-bold text-xs py-2.5 px-5 rounded-xl transition-all shadow-lg"
                >
                  {editingFlash ? 'Atualizar Flash' : 'Salvar Flash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FULLSCREEN SHOWCASE LIGHTBOX */}
      {viewingFlash && (
        <div
          onClick={() => setViewingFlash(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-[#1C1C1C] border border-[#3A3A3A] max-w-3xl w-full rounded-3xl overflow-hidden shadow-2xl space-y-4 p-5"
          >
            <div className="flex items-center justify-between border-b border-[#3A3A3A] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#FF6B35] uppercase tracking-widest">
                  {viewingFlash.estilo}
                </span>
                <h3 className="text-xl font-black text-[#F5F5F5]">{viewingFlash.titulo}</h3>
              </div>
              <button
                onClick={() => setViewingFlash(null)}
                className="text-[#999999] hover:text-white p-2 rounded-xl bg-[#2D2D2D]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative aspect-square max-h-[60vh] bg-black rounded-2xl overflow-hidden border border-[#2D2D2D] flex items-center justify-center">
              <img
                src={viewingFlash.imagem}
                alt={viewingFlash.titulo}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="space-y-1">
                <div className="flex items-center gap-3 text-xs text-[#999999]">
                  <span className="flex items-center gap-1">
                    <Ruler size={14} className="text-[#888888]" /> {viewingFlash.tamanhoCm}
                  </span>
                  <span className="text-[#555555]">•</span>
                  <span className="font-extrabold text-[#FF6B35]">
                    {formatCurrency(viewingFlash.preco)}
                  </span>
                </div>
                {viewingFlash.descricao && (
                  <p className="text-xs text-[#CCCCCC] max-w-lg">{viewingFlash.descricao}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleSendFlashWhatsApp(viewingFlash);
                    setViewingFlash(null);
                  }}
                  className="bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-lg"
                >
                  <MessageSquare size={16} />
                  <span>Enviar no WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: RESERVE FLASH FOR CLIENT */}
      {reservingFlash && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#2D2D2D] border border-[#3A3A3A] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#3A3A3A] pb-3">
              <div className="flex items-center gap-2 font-bold text-[#F5F5F5]">
                <UserCheck size={20} className="text-[#FFB703]" />
                <span>Reservar Projeto para Cliente</span>
              </div>
              <button
                onClick={() => setReservingFlash(null)}
                className="text-[#999999] hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#999999]">
              Arte: <strong>{reservingFlash.titulo}</strong> ({formatCurrency(reservingFlash.preco)})
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#999999] font-medium mb-1">
                  Selecionar Cliente da Lista
                </label>
                <select
                  value={selectedClienteId}
                  onChange={e => {
                    setSelectedClienteId(e.target.value);
                    const cli = clientes.find(c => c.id === e.target.value);
                    if (cli) setReserveClienteNome(cli.nome);
                  }}
                  className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl p-2.5 text-xs text-[#F5F5F5] focus:outline-none"
                >
                  <option value="">-- Selecione ou digite abaixo --</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#999999] font-medium mb-1">
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  value={reserveClienteNome}
                  onChange={e => setReserveClienteNome(e.target.value)}
                  placeholder="Nome do cliente"
                  className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl p-2.5 text-xs text-[#F5F5F5] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#3A3A3A]">
              <button
                onClick={() => setReservingFlash(null)}
                className="bg-[#1C1C1C] hover:bg-[#3A3A3A] text-[#999999] hover:text-white font-bold text-xs py-2 px-3.5 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReservation}
                className="bg-[#FFB703] hover:bg-[#e0a200] text-black font-bold text-xs py-2 px-4 rounded-xl transition-all shadow-lg"
              >
                Confirmar Reserva
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      <ConfirmModal
        isOpen={!!deletingFlashId}
        title="Excluir Flash"
        message="Tem certeza que deseja excluir este projeto da sua galeria?"
        confirmText="Excluir"
        cancelText="Cancelar"
        isDanger={true}
        onConfirm={() => {
          if (deletingFlashId) {
            deleteFlash(deletingFlashId);
            setDeletingFlashId(null);
          }
        }}
        onCancel={() => setDeletingFlashId(null)}
      />
    </div>
  );
};
