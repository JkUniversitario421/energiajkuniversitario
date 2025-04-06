"use client";

import { useState, useEffect } from "react";
import Head from "next/head";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
  }>;
};

export default function Home() {
  const [acomodacao, setAcomodacao] = useState("1");
  const [leituraAnterior, setLeituraAnterior] = useState("");
  const [leituraAtual, setLeituraAtual] = useState("");
  const [percentual, setPercentual] = useState("10");
  const [taxaIluminacao, setTaxaIluminacao] = useState("");
  const [valorCalculado, setValorCalculado] = useState("");
  const [whatsLink, setWhatsLink] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installButtonVisible, setInstallButtonVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      event.preventDefault();
      setDeferredPrompt(event);
      setInstallButtonVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setInstallButtonVisible(false);
        setDeferredPrompt(null);
      });
    }
  };

  const limparCampos = () => {
    setLeituraAnterior("");
    setLeituraAtual("");
    setPercentual("10");
    setTaxaIluminacao("");
    setValorCalculado("");
    setWhatsLink("");
  };

  const salvarLeitura = async () => {
    const anterior = parseFloat(leituraAnterior);
    const atual = parseFloat(leituraAtual);
    const taxaPerc = parseFloat(percentual) / 100;
    const consumo = atual - anterior;
    const adicional = consumo * taxaPerc;
    const taxa = parseFloat(taxaIluminacao);
    const valorFinal = consumo + adicional + taxa;

    setValorCalculado(valorFinal.toFixed(2));

    const payload = {
      acomodacao,
      leitura_anterior: anterior,
      leitura_atual: atual,
      consumo: consumo.toFixed(2),
      valor: valorFinal.toFixed(2),
      percentual: percentual,
      iluminacao: taxa.toFixed(2),
      data: new Date().toLocaleString("pt-BR"),
    };

    try {
      const res = await fetch("https://sheetdb.io/api/v1/5m0rz0rmv8jmg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: [payload] }),
      });

      if (res.ok) {
        alert("Leitura salva com sucesso!");
      } else {
        alert("Erro ao salvar leitura!");
      }
    } catch (error) {
      console.error("Erro ao enviar para SheetDB:", error);
      alert("Erro de conexão com a planilha.");
    }
  };

  const limparTelefone = (numero: string) => {
    const limpo = numero.replace(/\D/g, "");
    const valido = limpo.match(/^\d{10,13}$/);
    return valido ? limpo : "";
  };

  const gerarLinkWhatsComUltimoRegistro = async () => {
    try {
      const resLeitura = await fetch(`https://sheetdb.io/api/v1/5m0rz0rmv8jmg/search?acomodacao=${acomodacao}`);
      const leituras = await resLeitura.json();

      if (!leituras || leituras.length === 0) {
        alert("Nenhuma leitura encontrada para este quarto.");
        return;
      }

      const ultimo = leituras[leituras.length - 1];

      const resTelefone = await fetch(`https://sheetdb.io/api/v1/5m0rz0rmv8jmg/search?sheet=Telefones&acomodacao=${acomodacao}`);
      const telefones = await resTelefone.json();

      if (!telefones || telefones.length === 0) {
        alert("Telefone não encontrado para este quarto.");
        return;
      }

      const telefone = limparTelefone(telefones[0].telefone);
      const nomeCliente = telefones[0].nome || "Cliente";

      if (!telefone) {
        alert("Telefone inválido encontrado na planilha.");
        return;
      }

      const mensagem = `📊 *Leitura de Energia - Acomodacão ${ultimo.acomodacao}*\n👤 Cliente: ${nomeCliente}\n⚡ Consumo: ${ultimo.consumo} kWh\n💸 Valor: R$ ${ultimo.valor}`;
      const link = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
      setWhatsLink(link);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      alert("Erro ao buscar última leitura ou telefone.");
    }
  };

  const bgColor = darkMode ? "bg-black" : "bg-white";
  const textColor = darkMode ? "text-white" : "text-black";
  const inputStyle = `${bgColor} ${textColor} border p-2 rounded mt-1`;

  return (
    <>
      <Head>
        <title>Energia JK Universitário</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#000000" />
      </Head>
      <main className={`min-h-screen ${bgColor} ${textColor} p-4 flex flex-col items-center`}>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="mb-4 px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
        >
          {darkMode ? "☀️ Modo Claro" : "🌙 Modo Escuro"}
        </button>

        {installButtonVisible && (
          <button
            onClick={handleInstall}
            className="mb-4 px-4 py-2 rounded bg-green-700 text-white hover:bg-green-600"
          >
            📲 Instalar App
          </button>
        )}

        <h1 className="text-2xl font-bold mb-4">Energia JK Universitário</h1>

        <div className="grid gap-4 w-full max-w-md">
          <label className="flex flex-col">
            Acomodacão:
            <select
              className={inputStyle}
              value={acomodacao}
              onChange={(e) => {
                setAcomodacao(e.target.value);
                limparCampos();
              }}
            >
              {[...Array(7)].map((_, i) => (
                <option key={i} value={i + 1} className={inputStyle}>
                  Quarto {i + 1}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col">
            Leitura Anterior (kWh):
            <input
              type="number"
              className={inputStyle}
              value={leituraAnterior}
              onChange={(e) => setLeituraAnterior(e.target.value)}
            />
          </label>

          <label className="flex flex-col">
            Leitura Atual (kWh):
            <input
              type="number"
              className={inputStyle}
              value={leituraAtual}
              onChange={(e) => setLeituraAtual(e.target.value)}
            />
          </label>

          <label className="flex flex-col">
            % de Adicional sobre Consumo:
            <input
              type="number"
              className={inputStyle}
              value={percentual}
              onChange={(e) => setPercentual(e.target.value)}
            />
          </label>

          <label className="flex flex-col">
            Taxa de Iluminação Pública (R$):
            <input
              type="number"
              className={inputStyle}
              value={taxaIluminacao}
              onChange={(e) => setTaxaIluminacao(e.target.value)}
            />
          </label>

          {valorCalculado && (
            <div className="text-green-400 font-bold text-lg text-center">
              💰 Valor Total: R$ {valorCalculado}
            </div>
          )}

          <button
            onClick={salvarLeitura}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
          >
            📂 Salvar Leitura
          </button>

          <button
            onClick={gerarLinkWhatsComUltimoRegistro}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          >
            📋 WhatsApp com Última Leitura
          </button>

          {whatsLink && (
            <a
              href={whatsLink}
              target="_blank"
              className="text-green-400 font-medium underline text-center"
            >
              📲 Enviar via WhatsApp
            </a>
          )}

          <a
            href="/historico"
            className="border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white transition-colors px-4 py-2 rounded text-center mt-4"
          >
            📊 Ver Histórico de Leituras
          </a>
        </div>
      </main>
    </>
  );
}
