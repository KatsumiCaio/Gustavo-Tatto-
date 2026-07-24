# 🎨 Gustavo Tattoo - Agenda & Gestão de Estúdio

![React](https://img.shields.io/badge/React-18.3-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green)

Aplicação web completa desenvolvida para gestão de agenda, cadastro de clientes, fichas de anamnese, orientações pós-procedimento e galeria de projetos para tatuadores profissionais.

---

## 📌 Visão Geral

O **Gustavo Tattoo Agenda** é uma plataforma focada em organizar a rotina diária de um estúdio de tatuagem de forma rápida e prática. Desenvolvida com uma interface moderna em *dark mode*, a aplicação permite gerenciar compromissos, acompanhar o faturamento do estúdio, consultar o histórico de cada cliente e apresentar flashes e projetos disponíveis diretamente aos clientes.

---

## ✨ Principais Funcionalidades

### 📅 1. Agenda e Calendário Interativo
* **Visões Flexíveis:** Alternância entre visualizações por **Dia**, **Semana** e **Mês**.
* **Gestão de Agendamentos:** Cadastro completo do trabalho com cliente, data, horário de início/término, local da tatuagem, tamanho estimado, estilo e valor cobrado.
* **Status dos Trabalhos:** Controle de sessões *Agendadas*, *Concluídas*, *Pendentes* ou *Canceladas*.
* **💬 Confirmação via WhatsApp:** Envio com 1 clique de lembretes e confirmações com detalhes do agendamento formatados diretamente para o WhatsApp do cliente.

### 🩺 2. Ficha de Anamnese & Cuidados Pós-Tatuagem
* **Checklist de Saúde Completo:** Registro de alergias (látex, tintas, pomadas), condições da pele (quelóides, psoríase), medicamentos (anticoagulantes, Roacutan) e histórico de saúde geral (diabetes, hipertensão, gestação).
* **Termo de Responsabilidade:** Declaração de maioridade e veracidade das informações com opção de salvamento no histórico do cliente.
* **🧼 Guia de Cuidados Pós-Procedimento:** Texto padrão editável com orientações completas de higienização, aplicação de pomada, restrições (sol, praia, piscina) e alimentação.
* **Integração WhatsApp:** Compartilhamento imediato das instruções e ficha com o cliente.

### 🎨 3. Galeria de Flashes & Projetos Exclusivos
* **Portfólio Interativo:** Cadastro de desenhos e flashes com título, imagem, estilo (Blackwork, Fine Line, Neotradicional, etc.), tamanho estimado e preço.
* **👁️ Modo Vitrine para Estúdio:** Layout otimizado para apresentar os projetos disponíveis em um tablet ou celular aos clientes no estúdio.
* **Sistema de Reserva:** Reserva de projetos vinculada ao nome do cliente com atalho direto para agendamento no calendário.

### 👥 4. Gestão de Clientes & Histórico
* **Ficha do Cliente:** Registro de nome, telefone, Instagram e observações.
* **Histórico Unificado:** Consulta rápida de todos os trabalhos já realizados por cada cliente, valores investidos e fichas de anamnese associadas.

### 📊 5. Métricas e Resumo Financeiro
* **Relatórios e Estatísticas:** Acompanhamento do faturamento estimado vs. realizado.
* **Métricas por Estilo:** Indicadores dos estilos de tatuagem mais realizados no estúdio.

---

## 🛠️ Tecnologias Utilizadas

* **[React 18](https://react.dev/)** – Biblioteca principal para construção da interface.
* **[TypeScript](https://www.typescriptlang.org/)** – Tipagem estática para maior segurança e previsibilidade do código.
* **[Vite](https://vitejs.dev/)** – Build tool e servidor de desenvolvimento ultra-rápido.
* **[Tailwind CSS](https://tailwindcss.com/)** – Estilização utilitária e responsiva em *Dark Theme*.
* **[Lucide React](https://lucide.dev/)** – Conjunto de ícones vetoriais modernos.
* **[Motion / Framer Motion](https://motion.dev/)** – Animações suaves de transição de telas e elementos.
* **LocalStorage API** – Persistência de dados local segura sem necessidade de servidor externo.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
* **Node.js** (versão 18 ou superior)
* **npm** ou **yarn**

### Passo a Passo

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/gustavo-tattoo-agenda.git
   cd gustavo-tattoo-agenda
   ```

2. **Instalar as dependências:**
   ```bash
   npm install
   ```

3. **Iniciar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acessar no navegador:**
   Abra [http://localhost:3000](http://localhost:3000) para visualizar a aplicação.

---

## 📂 Estrutura do Projeto

```text
src/
├── components/          # Componentes reutilizáveis (Header, Cards, Modais)
├── contexts/            # Contexto global da aplicação (AgendaContext)
├── screens/             # Telas principais da aplicação
│   ├── MainScreen.tsx           # Dashboard inicial com atalhos
│   ├── AgendaScreen.tsx         # Calendário e lista de compromissos
│   ├── AddTatuagemScreen.tsx    # Formulário de novo agendamento
│   ├── CadastroClienteScreen.tsx# Cadastro de clientes
│   ├── ListaClientesScreen.tsx  # Lista e histórico por cliente
│   ├── AnamneseTermoScreen.tsx  # Ficha de anamnese e cuidados pós
│   ├── FlashesGalleryScreen.tsx # Galeria e vitrine de projetos
│   ├── HistoricoTrabalhosScreen.tsx # Histórico geral de trabalhos
│   └── SettingsScreen.tsx       # Métricas e configurações do sistema
├── services/            # Serviços de armazenamento local (StorageService)
├── types.ts             # Definições de interfaces e tipos TypeScript
├── App.tsx              # Componente raiz e roteamento de telas
└── main.tsx             # Ponto de entrada da aplicação
```

---

## 📜 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<p align="center">
  Desenvolvido com 🖤 para organizares eus trabalhos e elevar o atendimento do seu estúdio de tatuagem.
</p>
