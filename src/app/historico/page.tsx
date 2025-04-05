// src/app/historico/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Registro = {
  data: string;
  acomodacao: string;
  leitura_anterior: string;
  leitura_atual: string;
  consumo: string;
  valor: string;
  tarifa: string;
};

export default function Historico() {
  const [registros, setRegistros] = useState<Registro[]>([]);

  useEffect(() => {
    fetch("https://sheetdb.io/api/v1/5m0rz0rmv8jmg")
      .then((res) => res.json())
      .then((data) => setRegistros(data));
  }, []);

  return (
    <main className="p-4 max-w-4xl mx-auto min-h-screen bg-black text-white">
      <div className="mb-4">
        <Link href="/" className="text-blue-400 hover:underline">
          ← Voltar para a Página Inicial
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-4">📋 Histórico de Leituras</h1>

      <div className="overflow-auto">
        <table className="w-full text-sm border-collapse border border-white">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border border-white p-2">Data</th>
              <th className="border border-white p-2">Acomodação</th>
              <th className="border border-white p-2">Anterior</th>
              <th className="border border-white p-2">Atual</th>
              <th className="border border-white p-2">Consumo</th>
              <th className="border border-white p-2">Tarifa</th>
              <th className="border border-white p-2">Valor</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((r, i) => (
              <tr key={i} className="odd:bg-gray-900 even:bg-gray-800">
                <td className="border border-white p-2">{r.data}</td>
                <td className="border border-white p-2 text-center">{r.acomodacao}</td>
                <td className="border border-white p-2">{r.leitura_anterior}</td>
                <td className="border border-white p-2">{r.leitura_atual}</td>
                <td className="border border-white p-2">{r.consumo}</td>
                <td className="border border-white p-2">R$ {r.tarifa}</td>
                <td className="border border-white p-2">R$ {r.valor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
