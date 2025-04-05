// src/app/page.tsx
"use client";

import { useState } from "react";

export default function Home() {
  const [acomodacao, setAcomodacao] = useState("1");
  const [leituraAnterior, setLeituraAnterior] = useState("");
  const [leituraAtual, setLeituraAtual] = useState("");
  const [tarifa, setTarifa] = useState("");
  const [percentual, setPercentual] = useState("");
  const [taxaIluminacao, setTaxaIluminacao] = useState("");
  const [whatsLink, setWhatsLink] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  const limparCampos = () => {
    setLeituraAnterior("");
    setLeituraAtual("");
    setTarifa("");
    setPercentual("");
    setTaxaIluminacao("");
    setWhatsLink("");
  };

  const salvarLeitura = async () => {
    const anterior = parseFloat(leituraAnterior);
    const atual = parseFloat(leituraAtual);
    const tarifaBase = parseFloat(tarifa);
    const consumo = atual - anterior;
    const perc = parseFloat(percentual);
    const taxa = parseFloat(taxaIluminacao);
    const valorBase = consumo * tarifaBase;
    const adicional = valorBase * (perc / 100);
    const valorFinal = valorBase + adicional + taxa;

    const payload = {
      acomodacao,
      leitura_anterior: anterior,
      leitura_atual: atual,
      consumo: consumo.toFixed(2),
      valor: valorFinal.toFixed(2),
      tarifa: tarifaBase.toFixed(2),
      percentual: perc.toFixed(2),
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

      const telefoneBruto = telefones[0].telefone;
      const telefone = limparTelefone(telefoneBruto);

      if (!telefone) {
        alert("Telefone inválido encontrado na planilha.");
        return;
      }

      const mensagem = `📊 *Leitura de Energia - Acomodacão ${ultimo.acomodacao}*\n🔢 Leitura Anterior: ${ultimo.leitura_anterior} kWh\n🔢 Leitura Atual: ${ultimo.leitura_atual} kWh\n⚡ Consumo: ${ultimo.consumo} kWh\n💸 Valor: R$ ${ultimo.valor}\n💡 Tarifa base: R$ ${parseFloat(ultimo.tarifa).toFixed(2)} por kWh\n📈 % Adicional: ${ultimo.percentual}%\n💡 Iluminação: R$ ${ultimo.iluminacao}`;

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
    <main className={`min-h-screen ${bgColor} ${textColor} p-4 flex flex-col items-center`}>
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="mb-4 px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
      >
        {darkMode ? "☀️ Modo Claro" : "🌙 Modo Escuro"}
      </button>

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
          Tarifa Base (R$ por kWh):
          <input
            type="number"
            className={inputStyle}
            value={tarifa}
            onChange={(e) => setTarifa(e.target.value)}
          />
        </label>

        <label className="flex flex-col">
          % sobre valor base:
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
          className="text-blue-400 underline text-center mt-4"
        >
          📊 Ver Histórico de Leituras
        </a>
      </div>
    </main>
  );
}
