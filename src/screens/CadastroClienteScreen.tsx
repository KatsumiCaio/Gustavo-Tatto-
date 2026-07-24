import React, { useState } from 'react';
import { useAgenda } from '../contexts/AgendaContext';
import { User, Phone, Mail, Instagram, CheckCircle2, AlertCircle } from 'lucide-react';

export const CadastroClienteScreen: React.FC = () => {
  const { addCliente, clientes, navigate } = useAgenda();

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const maskPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(maskPhoneNumber(e.target.value));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!nome.trim() || !telefone.trim()) {
      setErrorMsg('Nome e Telefone são obrigatórios.');
      return;
    }

    // Check duplicate name
    const normalized = nome.trim().toLowerCase();
    const existing = clientes.find(c => c.nome.toLowerCase() === normalized);
    if (existing) {
      setErrorMsg(`Já existe um cliente cadastrado com o nome "${nome.trim()}".`);
      return;
    }

    addCliente({
      nome: nome.trim(),
      telefone: telefone.trim(),
      email: email.trim() || undefined,
      instagram: instagram.trim() || undefined,
    });

    setSuccessMsg('Cliente cadastrado com sucesso!');
    setNome('');
    setTelefone('');
    setEmail('');
    setInstagram('');

    setTimeout(() => {
      setSuccessMsg('');
    }, 3000);
  };

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6">
      <div className="bg-[#2D2D2D] border border-[#3A3A3A] rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#F5F5F5]">Novo Cliente</h2>
          <p className="text-xs text-[#999999] mt-1">
            Adicione um novo cliente para vincular a futuros agendamentos.
          </p>
        </div>

        {/* Toast Messages */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-[#4CAF50]/15 border border-[#4CAF50]/30 text-[#4CAF50] text-xs font-semibold flex items-center justify-center gap-2 animate-fade-in">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-[#E63946]/15 border border-[#E63946]/30 text-[#E63946] text-xs font-semibold flex items-center justify-center gap-2 animate-fade-in">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-xs font-semibold text-[#999999] mb-1.5">
              Nome Completo *
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-3 text-[#999999]" />
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Digite o nome do cliente"
                className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F5F5F5] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-xs font-semibold text-[#999999] mb-1.5">
              Telefone (WhatsApp) *
            </label>
            <div className="relative">
              <Phone size={18} className="absolute left-3.5 top-3 text-[#999999]" />
              <input
                type="text"
                value={telefone}
                onChange={handlePhoneChange}
                placeholder="(11) 99999-9999"
                maxLength={15}
                className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F5F5F5] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-[#999999] mb-1.5">
              E-mail
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-3 text-[#999999]" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="cliente@email.com"
                className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F5F5F5] focus:outline-none"
              />
            </div>
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-xs font-semibold text-[#999999] mb-1.5">
              Instagram
            </label>
            <div className="relative">
              <Instagram size={18} className="absolute left-3.5 top-3 text-[#999999]" />
              <input
                type="text"
                value={instagram}
                onChange={e => setInstagram(e.target.value)}
                placeholder="@usuario"
                className="w-full bg-[#1C1C1C] border border-[#3A3A3A] focus:border-[#FF6B35] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F5F5F5] focus:outline-none"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#FF6B35] hover:bg-[#E63946] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#FF6B35]/20 transition-all text-sm"
            >
              Salvar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
