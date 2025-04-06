"use client";

import { useEffect } from "react";

const useServiceWorker = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('Service Worker registrado com sucesso:', registration);
          })
          .catch((error) => {
            console.error('Erro ao registrar o Service Worker:', error);
          });
      });
    }
  }, []);
};

export default useServiceWorker;
