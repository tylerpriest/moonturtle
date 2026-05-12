import { useState } from 'react';

function canUseNativeShare(payload) {
  return typeof navigator !== 'undefined'
    && typeof navigator.share === 'function'
    && payload?.text;
}

function copyWithTextarea(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  if (!copied) throw new Error('Copy command failed');
}

async function copyText(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  if (typeof document === 'undefined') throw new Error('Clipboard is unavailable');
  copyWithTextarea(text);
}

export function ShareButton({ payload, label = 'Share Reading', className = '', style }) {
  const [status, setStatus] = useState('idle');
  const disabled = !payload?.text || status === 'working';
  const text = status === 'shared'
    ? 'Shared'
    : status === 'copied'
      ? 'Copied'
      : status === 'error'
        ? 'Unable to Share'
        : label;

  async function handleShare() {
    if (!payload?.text) return;
    setStatus('working');
    try {
      if (canUseNativeShare(payload)) {
        await navigator.share({
          title: payload.title,
          text: payload.text,
        });
        setStatus('shared');
      } else {
        await copyText(payload.text);
        setStatus('copied');
      }
    } catch (error) {
      if (error?.name === 'AbortError') {
        setStatus('idle');
        return;
      }
      try {
        await copyText(payload.text);
        setStatus('copied');
      } catch {
        setStatus('error');
      }
    } finally {
      window.setTimeout(() => {
        setStatus((current) => (current === 'working' ? current : 'idle'));
      }, 2200);
    }
  }

  return (
    <button
      type="button"
      className={`btn btn-ghost share-button ${className}`.trim()}
      style={style}
      onClick={handleShare}
      disabled={disabled}
      aria-live="polite"
    >
      {status === 'working' ? 'Sharing...' : text}
    </button>
  );
}
