/**
 * Execution runner with 300ms debounce, in-flight deduplication,
 * and guaranteed single trailing refresh.
 */
export function createSyncExecutor(
  refreshFn: () => void | Promise<void>,
  debounceMs: number = 300
) {
  let inFlight = false;
  let trailingRefreshNeeded = false;
  let isSuspended = false;
  let debounceTimer: NodeJS.Timeout | null = null;

  async function executeRefresh(): Promise<void> {
    if (typeof document !== "undefined" && document.visibilityState !== "visible") {
      return;
    }
    if (isSuspended) return;

    if (inFlight) {
      trailingRefreshNeeded = true;
      return;
    }

    inFlight = true;
    try {
      const res = refreshFn();
      if (res && typeof (res as Promise<void>).then === "function") {
        await res;
      }
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 429) {
        isSuspended = true;
      }
    } finally {
      inFlight = false;
      if (trailingRefreshNeeded) {
        trailingRefreshNeeded = false;
        void executeRefresh();
      }
    }
  }

  function triggerDebounced(): void {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      void executeRefresh();
    }, debounceMs);
  }

  function cancel(): void {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
  }

  return {
    triggerDebounced,
    executeRefresh,
    cancel,
    isInFlight: () => inFlight,
    isTrailingNeeded: () => trailingRefreshNeeded,
    isSuspended: () => isSuspended,
    resume: () => { isSuspended = false; },
  };
}
