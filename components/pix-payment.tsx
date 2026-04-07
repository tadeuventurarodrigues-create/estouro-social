'use client';

import { useEffect, useState } from 'react';

export function PixPayment({
  qrCode,
  qrCodeBase64,
  onClose,
}: {
  qrCode?: string;
  qrCodeBase64?: string;
  onClose?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  function copyPix() {
    if (!qrCode) return;
    navigator.clipboard.writeText(qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 16,
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 520,
          padding: 28,
          textAlign: 'center',
          position: 'relative',
          borderRadius: 24,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 42,
            height: 42,
            borderRadius: 12,
            border: '1px solid var(--border)',
            background: 'var(--surface-strong)',
            color: 'var(--text)',
            fontSize: 24,
            cursor: 'pointer',
          }}
        >
          ×
        </button>

        <h2 style={{ margin: '0 0 10px 0' }}>Pagamento Pix</h2>

        <p className="muted small" style={{ marginBottom: 20 }}>
          Escaneie o QR Code abaixo para pagar
        </p>

        {qrCodeBase64 && (
          <div
            style={{
              background: '#fff',
              padding: 18,
              borderRadius: 18,
              display: 'inline-block',
              marginBottom: 18,
            }}
          >
            <img
              src={`data:image/png;base64,${qrCodeBase64}`}
              alt="QR Code Pix"
              style={{
                width: 280,
                maxWidth: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          </div>
        )}

        {qrCode && (
          <div style={{ marginTop: 6 }}>
            <p className="muted small" style={{ marginBottom: 10 }}>
              Ou copie o código:
            </p>

            <textarea
              className="input"
              readOnly
              value={qrCode}
              style={{
                minHeight: 110,
                resize: 'none',
              }}
            />

            <button
              type="button"
              className="button primary"
              style={{ marginTop: 12 }}
              onClick={copyPix}
            >
              {copied ? 'Copiado!' : 'Copiar código Pix'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}