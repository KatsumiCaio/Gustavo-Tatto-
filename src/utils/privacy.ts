/**
 * Utility functions for masking sensitive data when privacy mode is enabled.
 */

export function formatValor(valor: number | string | undefined | null, modoPrivacidade: boolean): string {
  if (modoPrivacidade) {
    return 'R$ •••••';
  }
  const num = typeof valor === 'number' ? valor : parseFloat(String(valor || 0)) || 0;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
}

export function maskNomeCliente(nome: string | undefined | null, modoPrivacidade: boolean): string {
  if (!nome) return '';
  if (!modoPrivacidade) return nome;
  const parts = nome.trim().split(/\s+/);
  if (parts.length === 0) return '••••••';
  if (parts.length === 1) {
    const first = parts[0];
    if (first.length <= 2) return `${first}••`;
    return `${first.substring(0, 2)}••••`;
  }
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  return `${firstName} ${lastName.charAt(0)}.••••`;
}

export function maskTelefone(telefone: string | undefined | null, modoPrivacidade: boolean): string {
  if (!telefone) return '';
  if (!modoPrivacidade) return telefone;
  const digits = telefone.replace(/\D/g, '');
  if (digits.length >= 10) {
    const ddd = digits.substring(0, 2);
    return `(${ddd}) 9••••-••••`;
  }
  return '••••••••••';
}

export function maskInstagram(instagram: string | undefined | null, modoPrivacidade: boolean): string {
  if (!instagram) return '';
  if (!modoPrivacidade) return instagram;
  return '@••••••••';
}

export function maskObservacoes(obs: string | undefined | null, modoPrivacidade: boolean): string {
  if (!obs) return '';
  if (!modoPrivacidade) return obs;
  return '••••••••••••';
}
