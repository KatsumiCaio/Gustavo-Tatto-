import React from 'react';
import { AgendaProvider, useAgenda } from './contexts/AgendaContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { MainScreen } from './screens/MainScreen';
import { AgendaScreen } from './screens/AgendaScreen';
import { AddTatuagemScreen } from './screens/AddTatuagemScreen';
import { CadastroClienteScreen } from './screens/CadastroClienteScreen';
import { ListaClientesScreen } from './screens/ListaClientesScreen';
import { HistoricoTrabalhosScreen } from './screens/HistoricoTrabalhosScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { NotificacoesScreen } from './screens/NotificacoesScreen';
import { FaturamentoScreen } from './screens/FaturamentoScreen';

const ScreenRouter: React.FC = () => {
  const { currentScreen } = useAgenda();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'main':
        return <MainScreen />;
      case 'agenda':
        return <AgendaScreen />;
      case 'add_tatuagem':
        return <AddTatuagemScreen />;
      case 'cadastro_cliente':
        return <CadastroClienteScreen />;
      case 'lista_clientes':
        return <ListaClientesScreen />;
      case 'historico_trabalhos':
        return <HistoricoTrabalhosScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'notificacoes':
        return <NotificacoesScreen />;
      case 'faturamento':
        return <FaturamentoScreen />;
      default:
        return <MainScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[#1C1C1C] text-[#F5F5F5] flex flex-col selection:bg-[#FF6B35] selection:text-white">
      <Header />
      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 md:px-8 py-3 sm:py-6 pb-24 sm:pb-28">
        {renderScreen()}
      </main>
      <BottomNav />
    </div>
  );
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1C1C1C] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-[#2D2D2D] border border-[#FF6B35]/40 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B35]/20 text-[#FF6B35] flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h2 className="text-lg font-bold text-[#F5F5F5]">Ops, algo deu errado!</h2>
            <p className="text-xs text-[#999999]">
              Ocorreu uma falha temporária de renderização. Seus dados cadastrados estão seguros.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="w-full bg-[#FF6B35] hover:bg-[#E85D2A] text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg"
            >
              Recarregar Aplicativo
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AgendaProvider>
        <ScreenRouter />
      </AgendaProvider>
    </ErrorBoundary>
  );
}
