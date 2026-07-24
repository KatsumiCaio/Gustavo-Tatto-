import React, { useState, useEffect } from 'react';
import { useAgenda } from '../contexts/AgendaContext';
import { Cliente, Anamnese } from '../types';
import {
  FileText,
  ShieldAlert,
  Send,
  Copy,
  Printer,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Pill,
  Sparkles,
  User,
  Search,
  Trash2,
  MessageSquare,
  Check,
  Edit,
  ChevronDown,
  Info
} from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';

export const AnamneseTermoScreen: React.FC = () => {
  const { clientes, anamneses, addAnamnese, deleteAnamnese, navParams, navigate } = useAgenda();

  const [activeTab, setActiveTab] = useState<'anamnese' | 'cuidados' | 'historico'>(
    navParams.tab || 'anamnese'
  );

  // Client Selection / Information
  const [selectedClienteId, setSelectedClienteId] = useState<string>(navParams.clienteId || '');
  const [clienteNome, setClienteNome] = useState<string>(navParams.clienteNome || '');
  const [clienteTelefone, setClienteTelefone] = useState<string>('');

  // Anamnese Form State
  const [alergias, setAlergias] = useState({
    possuiAlergia: false,
    latex: false,
    tintas: false,
    pomadas: false,
    detalhes: '',
  });

  const [condicoesPele, setCondicoesPele] = useState({
    keloidOuCicatriz: false,
    psoriaseDermatite: false,
    manchasOuSinais: false,
    detalhes: '',
  });

  const [medicamentos, setMedicamentos] = useState({
    usaAnticoagulante: false,
    usaRoacutan: false,
    usaAntibiotico: false,
    detalhes: '',
  });

  const [saudeGeral, setSaudeGeral] = useState({
    diabetes: false,
    hipertensao: false,
    cardiopatia: false,
    epilepsia: false,
    gestanteOuLactante: false,
    hepatiteOuHiv: false,
    consumiuAlcool24h: false,
    outrasCondicoes: '',
  });

  const [confirmadoPeloCliente, setConfirmadoPeloCliente] = useState(true);
  const [observacoes, setObservacoes] = useState('');

  // Post Tattoo Care Custom Text
  const [cuidadosPersonalizados, setCuidadosPersonalizados] = useState<string>(`✨ CUIDADOS PÓS-TATUAGEM - INSTRUÇÕES IMPORTANTES ✨

Olá [NOME]! Para garantir que sua nova tatuagem cicatrize com cores vivas e perfeita definição, siga com carinho estas orientações:

🧼 1. HIGIENIZAÇÃO
- Remova o plástico/filme protetor de 2 a 4 horas após a sessão.
- Lave a região suavemente com água fria/morna e sabonete neutro ou antisséptico.
- Seque dando leves toques com papel toalha limpo (NÃO esfregue a toalha de banho).

🧴 2. POMADA CICATRIZANTE E HIDRATAÇÃO
- Após o 2º dia, comece a aplicar uma camada BEM FINA de pomada cicatrizante (2 a 3 vezes ao dia).
- Lembre-se: menos é mais! Excesso de pomada sufoca a pele e atrapalha a cicatrização.

🚫 3. PROIBIÇÕES DURANTE A CICATRIZAÇÃO (15 a 30 DIAS)
- ❌ NÃO coce e NUNCA arranque as casquinhas!
- ❌ NÃO vá à praia, mar, piscina, sauna, lagoa ou banheira.
- ❌ NÃO expor a tatuagem diretamente ao sol forte.
- ❌ Evite roupas muito apertadas ou sintéticas que atritem no local.

🥩 4. ALIMENTAÇÃO E HÁBITOS
- Evite alimentos gordurosos (carne de porco, frutos do mar, chocolate em excesso) nos primeiros 5 dias.
- Beba bastante água para manter a pele hidratada de dentro para fora.

Qualquer dúvida sobre a cicatrização, estou à disposição! Boa recuperação! 🎨✍️`);

  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [deletingAnamneseId, setDeletingAnamneseId] = useState<string | null>(null);
  const [searchTermHistory, setSearchTermHistory] = useState('');

  // Auto populate client if selected
  useEffect(() => {
    if (selectedClienteId) {
      const cli = clientes.find(c => c.id === selectedClienteId);
      if (cli) {
        setClienteNome(cli.nome);
        setClienteTelefone(cli.telefone);
      }
    }
  }, [selectedClienteId, clientes]);

  const handleSelectClientChange = (id: string) => {
    setSelectedClienteId(id);
    if (id) {
      const cli = clientes.find(c => c.id === id);
      if (cli) {
        setClienteNome(cli.nome);
        setClienteTelefone(cli.telefone);
      }
    }
  };

  const hasHealthAlerts =
    alergias.possuiAlergia ||
    alergias.latex ||
    alergias.tintas ||
    alergias.pomadas ||
    condicoesPele.keloidOuCicatriz ||
    medicamentos.usaAnticoagulante ||
    medicamentos.usaRoacutan ||
    saudeGeral.diabetes ||
    saudeGeral.cardiopatia ||
    saudeGeral.epilepsia ||
    saudeGeral.gestanteOuLactante ||
    saudeGeral.hepatiteOuHiv ||
    saudeGeral.consumiuAlcool24h;

  const handleSaveAnamnese = () => {
    if (!clienteNome.trim()) {
      alert('Por favor, informe ou selecione o nome do cliente.');
      return;
    }

    addAnamnese({
      clienteId: selectedClienteId || undefined,
      clienteNome: clienteNome.trim(),
      clienteTelefone: clienteTelefone.trim() || undefined,
      data: new Date().toISOString().split('T')[0],
      alergias,
      condicoesPele,
      medicamentos,
      saudeGeral,
      confirmadoPeloCliente,
      observacoes: observacoes.trim() || undefined,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const generateAnamneseTextSummary = () => {
    let text = `📋 *FICHA DE ANAMNESE E SAÚDE - STUDIO GUSTAVO TATTOO*\n\n`;
    text += `👤 *Cliente:* ${clienteNome || 'Cliente'}\n`;
    text += `📅 *Data:* ${new Date().toLocaleDateString('pt-BR')}\n\n`;

    text += `🩺 *CHECKLIST DE SAÚDE:*\n`;
    text += `- Alergias: ${
      alergias.possuiAlergia || alergias.latex || alergias.tintas || alergias.pomadas
        ? `⚠️ SIM (${[
            alergias.latex ? 'Látex' : '',
            alergias.tintas ? 'Tintas' : '',
            alergias.pomadas ? 'Pomadas' : '',
            alergias.detalhes,
          ]
            .filter(Boolean)
            .join(', ')})`
        : '✅ Não declarou alergias'
    }\n`;

    text += `- Pele/Quelóide: ${
      condicoesPele.keloidOuCicatriz || condicoesPele.psoriaseDermatite
        ? `⚠️ Alerta (${[
            condicoesPele.keloidOuCicatriz ? 'Tendência a quelóide' : '',
            condicoesPele.psoriaseDermatite ? 'Psoríase/Dermatite' : '',
            condicoesPele.detalhes,
          ]
            .filter(Boolean)
            .join(', ')})`
        : '✅ Pele sem alterações relatadas'
    }\n`;

    text += `- Medicamentos: ${
      medicamentos.usaAnticoagulante || medicamentos.usaRoacutan || medicamentos.usaAntibiotico
        ? `⚠️ SIM (${[
            medicamentos.usaAnticoagulante ? 'Anticoagulante' : '',
            medicamentos.usaRoacutan ? 'Roacutan' : '',
            medicamentos.usaAntibiotico ? 'Antibiótico' : '',
            medicamentos.detalhes,
          ]
            .filter(Boolean)
            .join(', ')})`
        : '✅ Sem uso de medicamentos restritivos'
    }\n`;

    const conds = [];
    if (saudeGeral.diabetes) conds.push('Diabetes');
    if (saudeGeral.hipertensao) conds.push('Hipertensão');
    if (saudeGeral.cardiopatia) conds.push('Cardiopatia');
    if (saudeGeral.epilepsia) conds.push('Epilepsia');
    if (saudeGeral.gestanteOuLactante) conds.push('Gestante/Lactante');
    if (saudeGeral.hepatiteOuHiv) conds.push('Hepatite/HIV');
    if (saudeGeral.consumiuAlcool24h) conds.push('Álcool/Drogas últimas 24h');
    if (saudeGeral.outrasCondicoes) conds.push(saudeGeral.outrasCondicoes);

    text += `- Condições Gerais: ${
      conds.length > 0 ? `⚠️ ${conds.join(', ')}` : '✅ Nenhuma condição impeditiva relatada'
    }\n\n`;

    if (observacoes) {
      text += `📝 *Observações:* ${observacoes}\n\n`;
    }

    text += `✅ Declaro ser maior de 18 anos e que as informações acima são verdadeiras.\n\n`;
    text += `Studio Gustavo Tattoo • Atendimento Profissional`;
    return text;
  };

  const handleSendAnamneseWhatsApp = () => {
    const text = generateAnamneseTextSummary();
    const cleanPhone = clienteTelefone.replace(/\D/g, '');
    const waPhone = cleanPhone.length === 10 || cleanPhone.length === 11 ? `55${cleanPhone}` : cleanPhone;

    const url = waPhone
      ? `https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const getFormattedCuidadosText = () => {
    const name = clienteNome ? clienteNome.trim() : 'Cliente';
    return cuidadosPersonalizados.replace(/\[NOME\]/g, name);
  };

  const handleSendCuidadosWhatsApp = () => {
    const text = getFormattedCuidadosText();
    const cleanPhone = clienteTelefone.replace(/\D/g, '');
    const waPhone = cleanPhone.length === 10 || cleanPhone.length === 11 ? `55${cleanPhone}` : cleanPhone;

    const url = waPhone
      ? `https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredAnamneses = anamneses.filter(a =>
    a.clienteNome.toLowerCase().includes(searchTermHistory.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Title & Description Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]/30 px-3.5 py-1.5 rounded-full text-xs font-bold mb-2">
          <ShieldAlert size={14} /> Anamnese & Segurança
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#F5F5F5]">
          Anamnese & Cuidados Pós-Tatuagem
        </h2>
        <p className="text-xs sm:text-sm text-[#999999] mt-1 max-w-xl mx-auto">
          Avalie o histórico de saúde do cliente e envie termos de consentimento e orientações de cuidados pós-procedimento.
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="flex bg-[#2D2D2D] p-1.5 rounded-2xl border border-[#3A3A3A] gap-1 max-w-lg mx-auto">
        <button
          onClick={() => setActiveTab('anamnese')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'anamnese'
              ? 'bg-[#FF6B35] text-white shadow-lg'
              : 'text-[#999999] hover:text-white hover:bg-[#333333]'
          }`}
        >
          <HeartPulse size={16} />
          <span>Ficha Anamnese</span>
        </button>

        <button
          onClick={() => setActiveTab('cuidados')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'cuidados'
              ? 'bg-[#FF6B35] text-white shadow-lg'
              : 'text-[#999999] hover:text-white hover:bg-[#333333]'
          }`}
        >
          <FileText size={16} />
          <span>Cuidados Pós</span>
        </button>

        <button
          onClick={() => setActiveTab('historico')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'historico'
              ? 'bg-[#FF6B35] text-white shadow-lg'
              : 'text-[#999999] hover:text-white hover:bg-[#333333]'
          }`}
        >
          <Search size={16} />
          <span>Fichas Salvas</span>
        </button>
      </div>

      {/* Client Quick Selector Header Bar */}
      {activeTab !== 'historico' && (
        <div className="bg-[#2D2D2D] border border-[#3A3A3A] p-4 rounded-2xl shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#FF6B35]">
            <User size={18} />
            <span>Dados do Cliente para o Documento</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-[#999999] font-medium mb-1">
                Selecionar Cliente Cadastrado
              </label>
              <select
                value={selectedClienteId}
                onChange={e => handleSelectClientChange(e.target.value)}
                className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl p-2.5 text-xs text-[#F5F5F5] focus:outline-none"
              >
                <option value="">-- Ou escolha da lista --</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nome} ({c.telefone})
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
                value={clienteNome}
                onChange={e => setClienteNome(e.target.value)}
                placeholder="Nome completo do cliente"
                className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl p-2.5 text-xs text-[#F5F5F5] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-[#999999] font-medium mb-1">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={clienteTelefone}
                onChange={e => setClienteTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl p-2.5 text-xs text-[#F5F5F5] focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: FICHA DE ANAMNESE */}
      {activeTab === 'anamnese' && (
        <div className="space-y-6">
          {/* Health Alert Summary Banner if any risk detected */}
          {hasHealthAlerts && (
            <div className="bg-[#FFB703]/10 border border-[#FFB703]/30 p-4 rounded-2xl flex items-start gap-3 text-xs text-[#FFB703]">
              <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold mb-0.5">Atenção para Alertas de Saúde:</strong>
                Foram marcados fatores de atenção que exigem cuidado adicional durante a sessão de tatuagem (alergias, medicamentos ou condição dermatológica).
              </div>
            </div>
          )}

          {/* Section 1: Alergias */}
          <div className="bg-[#2D2D2D] border border-[#3A3A3A] rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2 border-b border-[#3A3A3A] pb-2 text-base font-bold text-[#F5F5F5]">
              <Pill className="text-[#FF6B35]" size={20} />
              <h3>1. Alergias & Reações Sensíveis</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-3 bg-[#1C1C1C] border border-[#3A3A3A] p-3 rounded-xl cursor-pointer hover:border-[#FF6B35] transition-colors">
                <input
                  type="checkbox"
                  checked={alergias.latex}
                  onChange={e => setAlergias({ ...alergias, latex: e.target.checked })}
                  className="w-4 h-4 accent-[#FF6B35] rounded"
                />
                <span className="text-xs text-[#F5F5F5] font-medium">Alergia a Látex / Luvas</span>
              </label>

              <label className="flex items-center gap-3 bg-[#1C1C1C] border border-[#3A3A3A] p-3 rounded-xl cursor-pointer hover:border-[#FF6B35] transition-colors">
                <input
                  type="checkbox"
                  checked={alergias.tintas}
                  onChange={e => setAlergias({ ...alergias, tintas: e.target.checked })}
                  className="w-4 h-4 accent-[#FF6B35] rounded"
                />
                <span className="text-xs text-[#F5F5F5] font-medium">Alergia a Tintas / Pigmentos</span>
              </label>

              <label className="flex items-center gap-3 bg-[#1C1C1C] border border-[#3A3A3A] p-3 rounded-xl cursor-pointer hover:border-[#FF6B35] transition-colors">
                <input
                  type="checkbox"
                  checked={alergias.pomadas}
                  onChange={e => setAlergias({ ...alergias, pomadas: e.target.checked })}
                  className="w-4 h-4 accent-[#FF6B35] rounded"
                />
                <span className="text-xs text-[#F5F5F5] font-medium">Alergia a Pomadas / Anestésicos</span>
              </label>

              <label className="flex items-center gap-3 bg-[#1C1C1C] border border-[#3A3A3A] p-3 rounded-xl cursor-pointer hover:border-[#FF6B35] transition-colors">
                <input
                  type="checkbox"
                  checked={alergias.possuiAlergia}
                  onChange={e => setAlergias({ ...alergias, possuiAlergia: e.target.checked })}
                  className="w-4 h-4 accent-[#FF6B35] rounded"
                />
                <span className="text-xs text-[#F5F5F5] font-medium">Outras Alergias Medicamentosas</span>
              </label>
            </div>

            <div>
              <label className="block text-xs text-[#999999] mb-1">Detalhes sobre alergias (opcional)</label>
              <input
                type="text"
                value={alergias.detalhes}
                onChange={e => setAlergias({ ...alergias, detalhes: e.target.value })}
                placeholder="Ex: Alergia a Neomicina, dipirona, etc."
                className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl p-2.5 text-xs text-[#F5F5F5] focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Pele & Cicatrização */}
          <div className="bg-[#2D2D2D] border border-[#3A3A3A] rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2 border-b border-[#3A3A3A] pb-2 text-base font-bold text-[#F5F5F5]">
              <Sparkles className="text-[#FFB703]" size={20} />
              <h3>2. Condições da Pele & Cicatrização</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-3 bg-[#1C1C1C] border border-[#3A3A3A] p-3 rounded-xl cursor-pointer hover:border-[#FF6B35] transition-colors">
                <input
                  type="checkbox"
                  checked={condicoesPele.keloidOuCicatriz}
                  onChange={e => setCondicoesPele({ ...condicoesPele, keloidOuCicatriz: e.target.checked })}
                  className="w-4 h-4 accent-[#FF6B35] rounded"
                />
                <span className="text-xs text-[#F5F5F5] font-medium">Histórico de Quelóides</span>
              </label>

              <label className="flex items-center gap-3 bg-[#1C1C1C] border border-[#3A3A3A] p-3 rounded-xl cursor-pointer hover:border-[#FF6B35] transition-colors">
                <input
                  type="checkbox"
                  checked={condicoesPele.psoriaseDermatite}
                  onChange={e => setCondicoesPele({ ...condicoesPele, psoriaseDermatite: e.target.checked })}
                  className="w-4 h-4 accent-[#FF6B35] rounded"
                />
                <span className="text-xs text-[#F5F5F5] font-medium">Psoríase / Dermatite</span>
              </label>

              <label className="flex items-center gap-3 bg-[#1C1C1C] border border-[#3A3A3A] p-3 rounded-xl cursor-pointer hover:border-[#FF6B35] transition-colors">
                <input
                  type="checkbox"
                  checked={condicoesPele.manchasOuSinais}
                  onChange={e => setCondicoesPele({ ...condicoesPele, manchasOuSinais: e.target.checked })}
                  className="w-4 h-4 accent-[#FF6B35] rounded"
                />
                <span className="text-xs text-[#F5F5F5] font-medium">Verrugas / Pintas no local</span>
              </label>
            </div>
          </div>

          {/* Section 3: Medicamentos */}
          <div className="bg-[#2D2D2D] border border-[#3A3A3A] rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2 border-b border-[#3A3A3A] pb-2 text-base font-bold text-[#F5F5F5]">
              <HeartPulse className="text-[#E63946]" size={20} />
              <h3>3. Medicamentos em Uso</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-3 bg-[#1C1C1C] border border-[#3A3A3A] p-3 rounded-xl cursor-pointer hover:border-[#FF6B35] transition-colors">
                <input
                  type="checkbox"
                  checked={medicamentos.usaAnticoagulante}
                  onChange={e => setMedicamentos({ ...medicamentos, usaAnticoagulante: e.target.checked })}
                  className="w-4 h-4 accent-[#E63946] rounded"
                />
                <span className="text-xs text-[#F5F5F5] font-medium">Usa Anticoagulantes / AAS</span>
              </label>

              <label className="flex items-center gap-3 bg-[#1C1C1C] border border-[#3A3A3A] p-3 rounded-xl cursor-pointer hover:border-[#FF6B35] transition-colors">
                <input
                  type="checkbox"
                  checked={medicamentos.usaRoacutan}
                  onChange={e => setMedicamentos({ ...medicamentos, usaRoacutan: e.target.checked })}
                  className="w-4 h-4 accent-[#E63946] rounded"
                />
                <span className="text-xs text-[#F5F5F5] font-medium">Usa Roacutan (Isotretinoína)</span>
              </label>

              <label className="flex items-center gap-3 bg-[#1C1C1C] border border-[#3A3A3A] p-3 rounded-xl cursor-pointer hover:border-[#FF6B35] transition-colors">
                <input
                  type="checkbox"
                  checked={medicamentos.usaAntibiotico}
                  onChange={e => setMedicamentos({ ...medicamentos, usaAntibiotico: e.target.checked })}
                  className="w-4 h-4 accent-[#FF6B35] rounded"
                />
                <span className="text-xs text-[#F5F5F5] font-medium">Antibióticos / Anti-inflamatórios</span>
              </label>
            </div>
          </div>

          {/* Section 4: Saúde Geral */}
          <div className="bg-[#2D2D2D] border border-[#3A3A3A] rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2 border-b border-[#3A3A3A] pb-2 text-base font-bold text-[#F5F5F5]">
              <ShieldAlert className="text-[#FF6B35]" size={20} />
              <h3>4. Histórico de Saúde Geral</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label className="flex items-center gap-2.5 bg-[#1C1C1C] border border-[#3A3A3A] p-2.5 rounded-xl cursor-pointer hover:border-[#FF6B35]">
                <input
                  type="checkbox"
                  checked={saudeGeral.diabetes}
                  onChange={e => setSaudeGeral({ ...saudeGeral, diabetes: e.target.checked })}
                  className="w-4 h-4 accent-[#FF6B35] rounded"
                />
                <span className="text-xs text-[#F5F5F5]">Diabetes</span>
              </label>

              <label className="flex items-center gap-2.5 bg-[#1C1C1C] border border-[#3A3A3A] p-2.5 rounded-xl cursor-pointer hover:border-[#FF6B35]">
                <input
                  type="checkbox"
                  checked={saudeGeral.hipertensao}
                  onChange={e => setSaudeGeral({ ...saudeGeral, hipertensao: e.target.checked })}
                  className="w-4 h-4 accent-[#FF6B35] rounded"
                />
                <span className="text-xs text-[#F5F5F5]">Hipertensão</span>
              </label>

              <label className="flex items-center gap-2.5 bg-[#1C1C1C] border border-[#3A3A3A] p-2.5 rounded-xl cursor-pointer hover:border-[#FF6B35]">
                <input
                  type="checkbox"
                  checked={saudeGeral.cardiopatia}
                  onChange={e => setSaudeGeral({ ...saudeGeral, cardiopatia: e.target.checked })}
                  className="w-4 h-4 accent-[#FF6B35] rounded"
                />
                <span className="text-xs text-[#F5F5F5]">Cardiopatia</span>
              </label>

              <label className="flex items-center gap-2.5 bg-[#1C1C1C] border border-[#3A3A3A] p-2.5 rounded-xl cursor-pointer hover:border-[#FF6B35]">
                <input
                  type="checkbox"
                  checked={saudeGeral.epilepsia}
                  onChange={e => setSaudeGeral({ ...saudeGeral, epilepsia: e.target.checked })}
                  className="w-4 h-4 accent-[#FF6B35] rounded"
                />
                <span className="text-xs text-[#F5F5F5]">Epilepsia</span>
              </label>

              <label className="flex items-center gap-2.5 bg-[#1C1C1C] border border-[#3A3A3A] p-2.5 rounded-xl cursor-pointer hover:border-[#FF6B35]">
                <input
                  type="checkbox"
                  checked={saudeGeral.gestanteOuLactante}
                  onChange={e => setSaudeGeral({ ...saudeGeral, gestanteOuLactante: e.target.checked })}
                  className="w-4 h-4 accent-[#E63946] rounded"
                />
                <span className="text-xs text-[#F5F5F5]">Gestante / Lactante</span>
              </label>

              <label className="flex items-center gap-2.5 bg-[#1C1C1C] border border-[#3A3A3A] p-2.5 rounded-xl cursor-pointer hover:border-[#FF6B35]">
                <input
                  type="checkbox"
                  checked={saudeGeral.hepatiteOuHiv}
                  onChange={e => setSaudeGeral({ ...saudeGeral, hepatiteOuHiv: e.target.checked })}
                  className="w-4 h-4 accent-[#E63946] rounded"
                />
                <span className="text-xs text-[#F5F5F5]">Hepatite / HIV</span>
              </label>

              <label className="col-span-2 flex items-center gap-2.5 bg-[#1C1C1C] border border-[#3A3A3A] p-2.5 rounded-xl cursor-pointer hover:border-[#FF6B35]">
                <input
                  type="checkbox"
                  checked={saudeGeral.consumiuAlcool24h}
                  onChange={e => setSaudeGeral({ ...saudeGeral, consumiuAlcool24h: e.target.checked })}
                  className="w-4 h-4 accent-[#FFB703] rounded"
                />
                <span className="text-xs text-[#F5F5F5]">Álcool / Drogas nas últimas 24h</span>
              </label>
            </div>

            <div>
              <label className="block text-xs text-[#999999] mb-1">Observações adicionais de saúde</label>
              <textarea
                value={observacoes}
                onChange={e => setObservacoes(e.target.value)}
                placeholder="Anotações específicas do tatuador sobre o cliente..."
                rows={2}
                className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl p-2.5 text-xs text-[#F5F5F5] focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Declarations & Actions Bar */}
          <div className="bg-[#2D2D2D] border border-[#3A3A3A] p-5 rounded-2xl shadow-xl space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmadoPeloCliente}
                onChange={e => setConfirmadoPeloCliente(e.target.checked)}
                className="w-5 h-5 accent-[#FF6B35] rounded mt-0.5"
              />
              <span className="text-xs text-[#D1D1D1] leading-relaxed">
                <strong>Declaração de Responsabilidade:</strong> O cliente declara ter mais de 18 anos de idade e que as informações de saúde acima declaradas são verdadeiras, estando ciente dos riscos normais de cicatrização do procedimento.
              </span>
            </label>

            {savedSuccess && (
              <div className="bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Ficha de Anamnese salva com sucesso no sistema!</span>
              </div>
            )}

            {copiedSuccess && (
              <div className="bg-[#FF6B35]/10 border border-[#FF6B35]/30 text-[#FF6B35] p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check size={16} />
                <span>Resumo da Anamnese copiado para a área de transferência!</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#3A3A3A]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveAnamnese}
                  className="inline-flex items-center gap-1.5 bg-[#FF6B35] hover:bg-[#E85D2A] text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-lg"
                >
                  <CheckCircle2 size={16} />
                  <span>Salvar Ficha</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyText(generateAnamneseTextSummary())}
                  className="inline-flex items-center gap-1.5 bg-[#1C1C1C] hover:bg-[#3A3A3A] text-[#F5F5F5] font-bold text-xs py-2.5 px-3.5 rounded-xl border border-[#3A3A3A] transition-colors"
                >
                  <Copy size={15} />
                  <span>Copiar Texto</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 bg-[#1C1C1C] hover:bg-[#3A3A3A] text-[#999999] hover:text-white font-bold text-xs py-2.5 px-3.5 rounded-xl border border-[#3A3A3A] transition-colors hidden sm:inline-flex"
                >
                  <Printer size={15} />
                  <span>Imprimir</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleSendAnamneseWhatsApp}
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-lg active:scale-95"
              >
                <MessageSquare size={16} />
                <span>Enviar Resumo no WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CUIDADOS PÓS-TATUAGEM */}
      {activeTab === 'cuidados' && (
        <div className="space-y-6">
          <div className="bg-[#2D2D2D] border border-[#3A3A3A] p-5 rounded-2xl shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#3A3A3A] pb-3">
              <div className="flex items-center gap-2 text-base font-bold text-[#F5F5F5]">
                <FileText className="text-[#25D366]" size={20} />
                <h3>Instruções de Cuidados Pós-Tatuagem (Pré-Formatadas)</h3>
              </div>
              <span className="text-[11px] text-[#25D366] bg-[#25D366]/10 border border-[#25D366]/30 px-2.5 py-1 rounded-full font-bold">
                Pronto para Enviar
              </span>
            </div>

            <p className="text-xs text-[#999999]">
              Edite as instruções abaixo caso queira adaptar para o estúdio antes de enviar diretamente ao cliente.
            </p>

            <div>
              <textarea
                value={cuidadosPersonalizados}
                onChange={e => setCuidadosPersonalizados(e.target.value)}
                rows={14}
                className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#25D366] rounded-xl p-4 text-xs text-[#F5F5F5] font-mono leading-relaxed focus:outline-none"
              />
            </div>

            {copiedSuccess && (
              <div className="bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check size={16} />
                <span>Instruções copiadas com sucesso para a área de transferência!</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#3A3A3A]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyText(getFormattedCuidadosText())}
                  className="inline-flex items-center gap-1.5 bg-[#1C1C1C] hover:bg-[#3A3A3A] text-white font-bold text-xs py-2.5 px-4 rounded-xl border border-[#3A3A3A] transition-colors"
                >
                  <Copy size={16} />
                  <span>Copiar Texto</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 bg-[#1C1C1C] hover:bg-[#3A3A3A] text-[#999999] hover:text-white font-bold text-xs py-2.5 px-3.5 rounded-xl border border-[#3A3A3A] transition-colors hidden sm:inline-flex"
                >
                  <Printer size={15} />
                  <span>Imprimir Termo</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleSendCuidadosWhatsApp}
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold text-xs py-2.5 px-5 rounded-xl transition-all shadow-lg active:scale-95"
              >
                <MessageSquare size={16} />
                <span>Enviar Cuidados no WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HISTÓRICO DE FICHAS SALVAS */}
      {activeTab === 'historico' && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-3.5 text-[#999999]" />
            <input
              type="text"
              value={searchTermHistory}
              onChange={e => setSearchTermHistory(e.target.value)}
              placeholder="Buscar ficha por nome do cliente..."
              className="w-full bg-[#2D2D2D] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-2xl pl-10 pr-4 py-3 text-xs text-[#F5F5F5] focus:outline-none shadow-lg"
            />
          </div>

          {filteredAnamneses.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {filteredAnamneses.map(a => {
                const hasAlert =
                  a.alergias.possuiAlergia ||
                  a.alergias.latex ||
                  a.alergias.tintas ||
                  a.medicamentos.usaAnticoagulante ||
                  a.medicamentos.usaRoacutan ||
                  a.saudeGeral.diabetes ||
                  a.saudeGeral.cardiopatia ||
                  a.saudeGeral.epilepsia;

                return (
                  <div
                    key={a.id}
                    className="bg-[#2D2D2D] border border-[#3A3A3A] rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-[#F5F5F5]">{a.clienteNome}</h4>
                        {hasAlert ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#FFB703] bg-[#FFB703]/10 border border-[#FFB703]/30 px-2 py-0.5 rounded-full">
                            <AlertTriangle size={11} /> Alerta de Saúde
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#25D366] bg-[#25D366]/10 border border-[#25D366]/30 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={11} /> Ficha Ok
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#999999]">
                        <span>Data: {new Date(a.data + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                        {a.clienteTelefone && <span>Tel: {a.clienteTelefone}</span>}
                      </div>

                      {a.observacoes && (
                        <p className="text-xs text-[#888888] italic line-clamp-1">
                          "{a.observacoes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 border-t sm:border-t-0 border-[#3A3A3A] pt-2 sm:pt-0">
                      {a.clienteTelefone && (
                        <a
                          href={`https://wa.me/${
                            a.clienteTelefone.replace(/\D/g, '').length === 11 ||
                            a.clienteTelefone.replace(/\D/g, '').length === 10
                              ? '55' + a.clienteTelefone.replace(/\D/g, '')
                              : a.clienteTelefone.replace(/\D/g, '')
                          }?text=${encodeURIComponent(
                            `Olá ${a.clienteNome}! Reenviando suas instruções de cuidados pós-tatuagem:\n\n${getFormattedCuidadosText()}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl text-[#25D366] bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors"
                          title="Reenviar Cuidados no WhatsApp"
                        >
                          <MessageSquare size={16} />
                        </a>
                      )}

                      <button
                        onClick={() => setDeletingAnamneseId(a.id)}
                        className="p-2 rounded-xl text-[#999999] hover:text-[#E63946] hover:bg-[#1C1C1C] transition-colors"
                        title="Excluir Ficha"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#2D2D2D] border border-[#3A3A3A] rounded-2xl p-8 text-center space-y-2">
              <p className="text-sm text-[#999999] font-medium">Nenhuma ficha de anamnese salva.</p>
              <button
                onClick={() => setActiveTab('anamnese')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B35] bg-[#FF6B35]/10 hover:bg-[#FF6B35]/20 border border-[#FF6B35]/30 px-3.5 py-2 rounded-xl transition-colors"
              >
                <HeartPulse size={14} />
                <span>Preencher Nova Anamnese</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal for Deleting Anamnese Record */}
      <ConfirmModal
        isOpen={!!deletingAnamneseId}
        title="Excluir Ficha de Anamnese"
        message="Tem certeza que deseja excluir este registro de anamnese?"
        confirmText="Excluir"
        cancelText="Cancelar"
        isDanger={true}
        onConfirm={() => {
          if (deletingAnamneseId) {
            deleteAnamnese(deletingAnamneseId);
            setDeletingAnamneseId(null);
          }
        }}
        onCancel={() => setDeletingAnamneseId(null)}
      />
    </div>
  );
};
