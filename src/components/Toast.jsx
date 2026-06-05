import { useAppStore } from '../store/useAppStore.js';

export default function Toast() {
  const toast = useAppStore((state) => state.toast);

  if (!toast.show) return null;

  return (
    <div className={`toast toast--${toast.type}`} role="status">
      <i />
      <span>{toast.message}</span>
    </div>
  );
}
