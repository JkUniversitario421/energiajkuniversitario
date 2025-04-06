'use client';  // Certifique-se de que a diretiva 'use client' esteja presente

import { useState, useEffect } from "react";

export default function Home() {
  const [leituraAnterior, setLeituraAnterior] = useState("");
  const [leituraAtual, setLeituraAtual] = useState("");
  const [taxaIluminacao, setTaxaIluminacao] = useState("");
  const [valorCalculado, setValorCalculado] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  // Modificado para um tipo mais específico para o evento
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [installButtonVisible, setInstallButtonVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Previne o prompt de instalação padrão
      e.preventDefault();
      // Armazena o evento para dispará-lo quando o usuário clicar no botão
      setDeferredPrompt(e);
      setInstallButtonVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      // Exibe o prompt de instalação
      (deferredPrompt as BeforeInstallPromptEvent).prompt();
      (deferredPrompt as BeforeInstallPromptEvent).userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Usuário aceitou o prompt de instalação');
        } else {
          console.log('Usuário rejeitou o prompt de instalação');
        }
        setInstallButtonVisible(false);
        setDeferredPrompt(null);
      });
    }
  };

  return (
    <main>
      <div>
        <div>
          <label>Leitura Anterior:</label>
          <input 
            type="text" 
            value={leituraAnterior} 
            onChange={(e) => setLeituraAnterior(e.target.value)} 
          />
        </div>
        <div>
          <label>Leitura Atual:</label>
          <input 
            type="text" 
            value={leituraAtual} 
            onChange={(e) => setLeituraAtual(e.target.value)} 
          />
        </div>
        <div>
          <label>Taxa de Iluminação:</label>
          <input 
            type="text" 
            value={taxaIluminacao} 
            onChange={(e) => setTaxaIluminacao(e.target.value)} 
          />
        </div>
        <div>
          <label>Valor Calculado:</label>
          <input 
            type="text" 
            value={valorCalculado} 
            onChange={(e) => setValorCalculado(e.target.value)} 
          />
        </div>
        <div>
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? 'Modo Claro' : 'Modo Escuro'}
          </button>
        </div>
        {installButtonVisible && (
          <button onClick={handleInstall}>
            Instalar App
          </button>
        )}
      </div>
    </main>
  );
}
