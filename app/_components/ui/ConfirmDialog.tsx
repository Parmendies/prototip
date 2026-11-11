'use client';

import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

/** Tarayıcı confirm() yerine kullanılan onay penceresi. */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Onayla',
  cancelLabel = 'Vazgeç',
  danger = false,
  onConfirm,
  onClose,
  children,
  size = 'sm',
}: {
  isOpen: boolean;
  title: string;
  message?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={busy ? () => {} : onClose}
      title={title}
      size={size}
      footer={
        <div className="flex items-center gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} size="sm" onClick={handleConfirm} loading={busy}>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      {message && <div className="text-xs text-(--color-text-secondary) leading-relaxed">{message}</div>}
      {children}
    </Modal>
  );
}
