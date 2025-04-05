// src/app/page.tsx
"use client";

import { useState } from "react";

export default function Home() {
  const [acomodacao, setAcomodacao] = useState("1");
  const [leituraAnterior, setLeituraAnterior] = useState("");
  const [leituraAtual, setLeituraAtual] = useState("");
  const [tarifa, setTarifa] = useState("0.89");
  const [whatsLink, setWhatsLink] = useState("");

  const salvarLeitura = async () => {
    const anterior = parseFloat(leituraAnterior);
    const atual = parseFloat(leituraAtual);
    const taxa = parseFloat(tarifa);
    const consumo = atual - anterior;
    const valor = consumo * taxa;

    const payload = {
      acomodacao,
      leitura_anterior: anterior,
      leitura_atual: atual,
      consumo: consumo.toFixed(2),
      valor: valor.toFixed(2),
      tarifa: taxa,
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

      const mensagem = `📊 *Leitura de Energia - Acomodacão ${ultimo.acomodacao}*
🔢 Leitura Anterior: ${ultimo.leitura_anterior} kWh
🔢 Leitura Atual: ${ultimo.leitura_atual} kWh
⚡ Consumo: ${ultimo.consumo} kWh
💸 Valor: R$ ${ultimo.valor}
💡 Tarifa usada: R$ ${parseFloat(ultimo.tarifa).toFixed(2)} por kWh`;

      const link = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
      setWhatsLink(link);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      alert("Erro ao buscar última leitura ou telefone.");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-white mb-4">
        Energia JK Universitário
      </h1>

      <div className="grid gap-4 w-full max-w-md">
        <label className="flex flex-col">
          Acomodacão:
          <select
            className="border p-2 rounded mt-1 text-black"
            value={acomodacao}
            onChange={(e) => setAcomodacao(e.target.value)}
          >
            {[...Array(7)].map((_, i) => (
              <option key={i} value={i + 1}>
                Quarto {i + 1}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col">
          Leitura Anterior (kWh):
          <input
            type="number"
            className="border p-2 rounded mt-1 text-black"
            value={leituraAnterior}
            onChange={(e) => setLeituraAnterior(e.target.value)}
          />
        </label>

        <label className="flex flex-col">
          Leitura Atual (kWh):
          <input
            type="number"
            className="border p-2 rounded mt-1 text-black"
            value={leituraAtual}
            onChange={(e) => setLeituraAtual(e.target.value)}
          />
        </label>

        <label className="flex flex-col">
          Tarifa por kWh (R$):
          <input
            type="number"
            className="border p-2 rounded mt-1 text-black"
            value={tarifa}
            onChange={(e) => setTarifa(e.target.value)}
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
