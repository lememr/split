/**
 * Split Tracking Pixel v1.0
 * 
 * Como usar:
 * 1. No HTML da sua landing page, adicione:
 *    <script src="https://SEU_SITE.vercel.app/pixel.js" data-page-id="ID_DA_PAGINA"></script>
 * 
 * 2. Para registrar uma CONVERSÃO (ex: quando usuário compra/cadastra):
 *    <script>splitConvert();</script>
 *    ou chame splitConvert() em qualquer evento (onclick, onsubmit, etc.)
 * 
 * O ID da página é passado automaticamente pelo atributo data-page-id.
 * O token secreto é configurado no servidor — não é exposto no JS.
 */

(function() {
  'use strict';

  const scriptTag = document.currentScript || document.querySelector('script[src*="pixel.js"]');
  const pageId = scriptTag?.getAttribute('data-page-id');
  const baseUrl = scriptTag?.src.replace('/pixel.js', '') || '';

  if (!pageId) {
    console.warn('[Split Pixel] Missing data-page-id attribute');
    return;
  }

  // Track visit on page load
  function trackVisit() {
    const img = new Image();
    img.src = `${baseUrl}/api/track?type=visit&pageId=${encodeURIComponent(pageId)}`;
    img.style.display = 'none';
    document.body.appendChild(img);
    setTimeout(() => img.remove(), 5000);
  }

  // Track conversion (called by landing page)
  window.splitConvert = function() {
    const img = new Image();
    // Note: conversion requires server-side secret token for security
    // The conversion endpoint is designed to be called from the admin or trusted sources
    img.src = `${baseUrl}/api/track?type=conversion&pageId=${encodeURIComponent(pageId)}`;
    img.style.display = 'none';
    document.body.appendChild(img);
    setTimeout(() => img.remove(), 5000);
    console.log('[Split Pixel] Conversion tracked for page:', pageId);
  };

  // Track visit automatically
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackVisit);
  } else {
    trackVisit();
  }
})();
