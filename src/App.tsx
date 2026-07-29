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
      default:
        return <MainScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[#1C1C1C] text-[#F5F5F5] flex flex-col selection:bg-[#FF6B35] selection:text-white">
      <Header />
      <main className="flex-1 pb-24 md:pb-12">
        {renderScreen()}
      </main>
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AgendaProvider>
      <ScreenRouter />
    </AgendaProvider>
  );
}
