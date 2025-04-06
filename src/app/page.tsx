'use client';

import { useState, useEffect, ChangeEvent, MouseEvent } from "react";

// Tipagem para o evento beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

export default function Home() {
  const [leituraAnterior, setLeituraAnterior] = useState<string>("");
  const [leituraAtual, setLeituraAtual] = useState<string>("");
  const [taxaIluminacao, setTaxaIluminacao] = useState<string>("");
  const [valorCalculado, setValorCalculado] = useState<string>("");
  const [darkMode, setDarkMode] = useState<boolean>(true);

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installButtonVisible, setInstallButtonVisible] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setInstallButtonVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: {
        outcome: 'accepted' | 'dismissed';
        platform: string;
      }) => {
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

  const handleInputChange = (setter: (value: string) => void) => 
    (e: ChangeEvent<HTMLInputElement>) => setter(e.target.value);

  return (
    <main>
      <div>
        <div>
          <label>Leitura Anterior:</label>
          <input 
            type="text" 
            value={leituraAnterior} 
            onChange={handleInputChange(setLeituraAnterior)} 
          />
        </div>
        <div>
          <label>Leitura Atual:</label>
          <input 
            type="text" 
            value={leituraAtual} 
            onChange={handleInputChange(setLeituraAtual)} 
          />
        </div>
        <div>
          <label>Taxa de Iluminação:</label>
          <input 
            type="text" 
            value={taxaIluminacao} 
            onChange={handleInputChange(setTaxaIluminacao)} 
          />
        </div>
        <div>
          <label>Valor Calculado:</label>
          <input 
            type="text" 
            value={valorCalculado} 
            onChange={handleInputChange(setValorCalculado)} 
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
