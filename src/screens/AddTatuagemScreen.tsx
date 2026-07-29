import React, { useState, useEffect } from 'react';
import { useAgenda } from '../contexts/AgendaContext';
import { Cliente } from '../types';
import { compressImage } from '../utils/imageCompressor';
import { User, UserPlus, Pencil, MapPin, DollarSign, Calendar, Clock, MessageSquare, Camera, X, CheckCircle2, Sparkles, Search, Instagram, Phone, Bell } from 'lucide-react';

export const AddTatuagemScreen: React.FC = () => {
  const { clientes, addTatuagem, updateTatuagem, tatuagens, navParams, navigate, permissaoNotificacaoState, solicitarPermissaoNotificacaoSistema } = useAgenda();

  const editingId = navParams.tatuagemId;
  const isEditing = !!editingId;

  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');

  const [descricao, setDescricao] = useState('');
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().split('T')[0]);
  const [horario, setHorario] = useState('10:00');
  const [local, setLocal] = useState('');
  const [valor, setValor] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [imagemModelo, setImagemModelo] = useState<string | null>(null);

  // Notification state
  const [notificacaoAtivar, setNotificacaoAtivar] = useState(true);
  const [notificacaoOpcao, setNotificacaoOpcao] = useState<'mesmo_horario' | '15min' | '30min' | '1hora' | '2horas' | '1dia' | 'personalizado'>('1hora');
  const [notificacaoDataPersonalizada, setNotificacaoDataPersonalizada] = useState(() => new Date().toISOString().split('T')[0]);
  const [notificacaoHorarioPersonalizado, setNotificacaoHorarioPersonalizado] = useState('09:00');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (isEditing && editingId) {
      const existing = tatuagens.find(t => t.id === editingId);
      if (existing) {
        const cli = clientes.find(c => c.nome === existing.cliente) || null;
        setSelectedCliente(cli || { id: 'temp', nome: existing.cliente, telefone: existing.telefone || '' });
        setDescricao(existing.descricao || '');
        setDateStr(existing.data || new Date().toISOString().split('T')[0]);
        setHorario(existing.horario || '10:00');
        setLocal(existing.local || '');
        setValor(existing.valor ? String(existing.valor) : '');
        setObservacoes(existing.observacoes || '');
        setImagemModelo(existing.imagemModelo || null);

        setNotificacaoAtivar(existing.notificacaoAtivar !== false);
        setNotificacaoOpcao(existing.notificacaoOpcao || '1hora');
        setNotificacaoDataPersonalizada(existing.notificacaoDataPersonalizada || existing.data || new Date().toISOString().split('T')[0]);
        setNotificacaoHorarioPersonalizado(existing.notificacaoHorarioPersonalizado || existing.horario || '09:00');
      }
    }
  }, [isEditing, editingId, tatuagens, clientes]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 800, 800, 0.75);
      setImagemModelo(compressed);
    } catch (err) {
      console.error('Erro ao comprimir imagem:', err);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!selectedCliente) newErrors.cliente = 'Selecione um cliente';
    if (!descricao.trim()) newErrors.descricao = 'Descrição é obrigatória';
    if (!dateStr) newErrors.data = 'Data é obrigatória';
    if (!horario) newErrors.horario = 'Horário é obrigatório';
    if (!valor || isNaN(parseFloat(valor))) newErrors.valor = 'Valor numérico é obrigatório';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const payload = {
      cliente: selectedCliente!.nome,
      descricao: descricao.trim(),
      data: dateStr,
      horario,
      local: local.trim() || 'Não especificado',
      valor: parseFloat(valor),
      status: (isEditing ? (tatuagens.find(t => t.id === editingId)?.status || 'agendado') : 'agendado') as any,
      telefone: selectedCliente!.telefone || undefined,
      observacoes: observacoes.trim() || undefined,
      imagemModelo: imagemModelo || undefined,

      notificacaoAtivar,
      notificacaoOpcao,
      notificacaoDataPersonalizada: notificacaoOpcao === 'personalizado' ? notificacaoDataPersonalizada : undefined,
      notificacaoHorarioPersonalizado: notificacaoOpcao === 'personalizado' ? notificacaoHorarioPersonalizado : undefined,
    };

    if (isEditing && editingId) {
      updateTatuagem(editingId, payload);
    } else {
      addTatuagem(payload);
    }

    setSuccessMsg(true);
    if (!isEditing) {
      setSelectedCliente(null);
      setDescricao('');
      setDateStr(new Date().toISOString().split('T')[0]);
      setHorario('10:00');
      setLocal('');
      setValor('');
      setObservacoes('');
      setImagemModelo(null);
    }

    setTimeout(() => {
      setSuccessMsg(false);
      if (isEditing) {
        navigate('agenda');
      }
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="bg-[#2D2D2D] border border-[#3A3A3A] rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#F5F5F5]">
            {isEditing ? 'Editar Agendamento' : 'Agendar Tatuagem'}
          </h2>
          <p className="text-xs text-[#999999] mt-1">
            Preencha os detalhes do trabalho e vincule ao cliente.
          </p>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-[#4CAF50]/15 border border-[#4CAF50]/30 text-[#4CAF50] text-sm font-semibold flex items-center justify-center gap-2 animate-fade-in">
            <CheckCircle2 size={18} />
            <span>Tatuagem {isEditing ? 'atualizada' : 'agendada'} com sucesso!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Cliente Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#999999]">
                Cliente *
              </label>
              <button
                type="button"
                onClick={() => navigate('cadastro_cliente')}
                className="inline-flex items-center gap-1 text-xs text-[#FF6B35] hover:underline font-semibold"
              >
                <UserPlus size={14} /> Novo Cliente
              </button>
            </div>

            <div
              onClick={() => setIsClientModalOpen(true)}
              className={`flex items-center gap-3 bg-[#1C1C1C] border ${
                errors.cliente ? 'border-[#E63946]' : 'border-[#3A3A3A]'
              } rounded-xl px-3.5 py-3 cursor-pointer hover:border-[#FF6B35] transition-colors`}
            >
              <User size={18} className="text-[#999999]" />
              <span className={`text-sm font-medium ${selectedCliente ? 'text-white' : 'text-[#999999]'}`}>
                {selectedCliente ? selectedCliente.nome : 'Selecione um cliente da lista'}
              </span>
            </div>
            {errors.cliente && <p className="text-xs text-[#E63946]">{errors.cliente}</p>}
          </div>

          {/* Tattoo Details */}
          <div className="space-y-4 border-t border-[#3A3A3A] pt-4">
            <h3 className="text-xs font-bold text-[#FF6B35] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} /> Detalhes da Tatuagem
            </h3>

            {/* Descrição */}
            <div>
              <label className="block text-xs font-semibold text-[#999999] mb-1">
                Descrição do Trabalho *
              </label>
              <div className="relative">
                <Pencil size={18} className="absolute left-3.5 top-3 text-[#999999]" />
                <textarea
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  placeholder="Ex: Leão realista no antebraço em tom sombreado"
                  rows={3}
                  className={`w-full bg-[#1C1C1C] border ${
                    errors.descricao ? 'border-[#E63946]' : 'border-[#3A3A3A]'
                  } focus:border-[#FF6B35] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F5F5F5] focus:outline-none`}
                />
              </div>
              {errors.descricao && <p className="text-xs text-[#E63946] mt-1">{errors.descricao}</p>}
            </div>

            {/* Reference Image Upload */}
            <div>
              <label className="block text-xs font-semibold text-[#999999] mb-1">
                Imagem de Referência / Modelo
              </label>
              {imagemModelo ? (
                <div className="relative rounded-2xl overflow-hidden border border-[#3A3A3A] h-48 bg-black">
                  <img src={imagemModelo} alt="Modelo" className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => setImagemModelo(null)}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#3A3A3A] hover:border-[#FF6B35] rounded-2xl cursor-pointer bg-[#1C1C1C]/50 transition-colors group">
                  <Camera size={24} className="text-[#999999] group-hover:text-[#FF6B35] transition-colors mb-1" />
                  <span className="text-xs font-semibold text-[#999999] group-hover:text-white transition-colors">
                    Clique para selecionar imagem de modelo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Local no Corpo & Valor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#999999] mb-1">
                  Local no Corpo
                </label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3.5 top-3 text-[#999999]" />
                  <input
                    type="text"
                    value={local}
                    onChange={e => setLocal(e.target.value)}
                    placeholder="Ex: Antebraço direito"
                    className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F5F5F5] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#999999] mb-1">
                  Valor (R$) *
                </label>
                <div className="relative">
                  <DollarSign size={18} className="absolute left-3.5 top-3 text-[#FFB703]" />
                  <input
                    type="number"
                    step="0.01"
                    value={valor}
                    onChange={e => setValor(e.target.value)}
                    placeholder="0.00"
                    className={`w-full bg-[#1C1C1C] border ${
                      errors.valor ? 'border-[#E63946]' : 'border-[#3A3A3A]'
                    } focus:border-[#FF6B35] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F5F5F5] focus:outline-none font-bold text-[#FFB703]`}
                  />
                </div>
                {errors.valor && <p className="text-xs text-[#E63946] mt-1">{errors.valor}</p>}
              </div>
            </div>
          </div>

          {/* Agendamento Schedule */}
          <div className="space-y-4 border-t border-[#3A3A3A] pt-4">
            <h3 className="text-xs font-bold text-[#FF6B35] uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={14} /> Agendamento
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#999999] mb-1">
                  Data *
                </label>
                <input
                  type="date"
                  value={dateStr}
                  onChange={e => setDateStr(e.target.value)}
                  className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl px-3.5 py-2.5 text-sm text-[#F5F5F5] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#999999] mb-1">
                  Horário *
                </label>
                <input
                  type="time"
                  value={horario}
                  onChange={e => setHorario(e.target.value)}
                  className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl px-3.5 py-2.5 text-sm text-[#F5F5F5] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#999999] mb-1">
                Observações
              </label>
              <div className="relative">
                <MessageSquare size={18} className="absolute left-3.5 top-3 text-[#999999]" />
                <input
                  type="text"
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  placeholder="Informações sobre pele, agulhas, alergia..."
                  className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F5F5F5] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Notificação & Lembrete */}
          <div className="space-y-4 border-t border-[#3A3A3A] pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#FF6B35] uppercase tracking-wider flex items-center gap-1.5">
                <Bell size={14} /> Notificação & Lembrete
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificacaoAtivar}
                  onChange={async e => {
                    const checked = e.target.checked;
                    setNotificacaoAtivar(checked);
                    if (checked && permissaoNotificacaoState !== 'granted') {
                      await solicitarPermissaoNotificacaoSistema();
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#1C1C1C] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B35]"></div>
                <span className="ml-2.5 text-xs font-bold text-[#F5F5F5]">
                  {notificacaoAtivar ? 'Ativada' : 'Desativada'}
                </span>
              </label>
            </div>

            {notificacaoAtivar && (
              <div className="bg-[#1C1C1C] border border-[#3A3A3A] p-4 rounded-2xl space-y-3.5 animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold text-[#999999] mb-1.5">
                    Quando deseja receber a notificação de lembrete?
                  </label>
                  <select
                    value={notificacaoOpcao}
                    onChange={e => setNotificacaoOpcao(e.target.value as any)}
                    className="w-full bg-[#2D2D2D] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl px-3.5 py-2.5 text-sm text-[#F5F5F5] focus:outline-none font-medium cursor-pointer"
                  >
                    <option value="mesmo_horario">⚡ No mesmo horário da sessão ({horario}h)</option>
                    <option value="15min">⏱️ 15 minutos antes da sessão</option>
                    <option value="30min">⏱️ 30 minutos antes da sessão</option>
                    <option value="1hora">⏰ 1 hora antes da sessão (Recomendado)</option>
                    <option value="2horas">⏰ 2 horas antes da sessão</option>
                    <option value="1dia">📅 1 dia antes (no dia anterior)</option>
                    <option value="personalizado">✏️ Data e Horário personalizados...</option>
                  </select>
                </div>

                {notificacaoOpcao === 'personalizado' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#3A3A3A]/60">
                    <div>
                      <label className="block text-xs font-semibold text-[#999999] mb-1">
                        Data da Notificação
                      </label>
                      <input
                        type="date"
                        value={notificacaoDataPersonalizada}
                        onChange={e => setNotificacaoDataPersonalizada(e.target.value)}
                        className="w-full bg-[#2D2D2D] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#999999] mb-1">
                        Horário da Notificação
                      </label>
                      <input
                        type="time"
                        value={notificacaoHorarioPersonalizado}
                        onChange={e => setNotificacaoHorarioPersonalizado(e.target.value)}
                        className="w-full bg-[#2D2D2D] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-[#FFB703] flex items-center gap-1 font-medium pt-1">
                  <Clock size={12} />
                  O lembrete será gerado automaticamente na Aba de Notificações.
                </p>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#FF6B35] hover:bg-[#E63946] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-[#FF6B35]/20 transition-all text-sm flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              <span>{isEditing ? 'Salvar Alterações' : '✨ Agendar Tatuagem'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Modal Selection for Client */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#2D2D2D] border border-[#3A3A3A] rounded-2xl max-w-md w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#3A3A3A] bg-[#2A2A2A]">
              <h3 className="text-base font-bold text-[#F5F5F5]">Selecione um Cliente</h3>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="p-1 rounded-lg text-[#999999] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-[#3A3A3A] bg-[#222222]">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-2.5 text-[#999999]" />
                <input
                  type="text"
                  value={clientSearchTerm}
                  onChange={e => setClientSearchTerm(e.target.value)}
                  placeholder="Pesquisar por nome, número ou @instagram..."
                  className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F5F5F5] focus:outline-none placeholder:text-[#777777]"
                  autoFocus
                />
                {clientSearchTerm && (
                  <button
                    onClick={() => setClientSearchTerm('')}
                    className="absolute right-3 top-2.5 text-[#999999] hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="p-3 overflow-y-auto divide-y divide-[#3A3A3A]/50">
              {(() => {
                const term = clientSearchTerm.trim().toLowerCase();
                const filtered = clientes.filter(cli => {
                  if (!term) return true;
                  const matchNome = cli.nome.toLowerCase().includes(term);
                  const matchTelefone = cli.telefone.toLowerCase().includes(term) || cli.telefone.replace(/\D/g, '').includes(term.replace(/\D/g, ''));
                  const matchInsta = cli.instagram ? cli.instagram.toLowerCase().includes(term) : false;
                  return matchNome || matchTelefone || matchInsta;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <p className="text-xs text-[#999999] mb-3">
                        {clientes.length === 0
                          ? 'Nenhum cliente cadastrado ainda.'
                          : `Nenhum cliente encontrado para "${clientSearchTerm}".`}
                      </p>
                      <button
                        onClick={() => {
                          setIsClientModalOpen(false);
                          navigate('cadastro_cliente');
                        }}
                        className="bg-[#FF6B35] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#E63946] transition-colors"
                      >
                        + Cadastrar Novo Cliente
                      </button>
                    </div>
                  );
                }

                return filtered.map(cli => (
                  <button
                    key={cli.id}
                    onClick={() => {
                      setSelectedCliente(cli);
                      setIsClientModalOpen(false);
                      setClientSearchTerm('');
                    }}
                    className="w-full py-3 px-3 text-left hover:bg-[#333333] transition-colors rounded-xl flex items-center justify-between group"
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-[#F5F5F5] group-hover:text-[#FF6B35] transition-colors">
                        {cli.nome}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-[#999999]">
                        {cli.telefone && (
                          <span className="flex items-center gap-1">
                            <Phone size={11} className="text-[#888888]" />
                            {cli.telefone}
                          </span>
                        )}
                        {cli.instagram && (
                          <span className="flex items-center gap-1 text-[#FF6B35]/80 font-medium">
                            <Instagram size={11} />
                            {cli.instagram}
                          </span>
                        )}
                      </div>
                    </div>
                    <User size={16} className="text-[#999999] group-hover:text-[#FF6B35] shrink-0 ml-2" />
                  </button>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
