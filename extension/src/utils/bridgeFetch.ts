type PendingRequest = {
  resolve: (value: any) => void;
  reject: (reason: any) => void;
};

function getPendingRequests(): Map<string, PendingRequest> {
  const w = window as any;
  if (!w.__bridgeFetchPending) {
    w.__bridgeFetchPending = new Map<string, PendingRequest>();
  }
  return w.__bridgeFetchPending;
}

if (!(window as any).__resolveBridgeFetch) {
  (window as any).__resolveBridgeFetch = (
    id: string,
    result: { ok: boolean; data?: any; error?: string },
  ) => {
    const pendingRequests = getPendingRequests();
    const pending = pendingRequests.get(id);
    if (!pending) return;

    pendingRequests.delete(id);

    if (result.ok) {
      pending.resolve(result.data);
    } else {
      pending.reject(new Error(result.error ?? "Unknown bridge error"));
    }
  };
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

interface BridgeFetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
}

export function bridgeFetch<T = any>(
  url: string,
  options: BridgeFetchOptions = {},
): Promise<T> {
  const id = generateId();
  const { timeoutMs = 15000, ...rest } = options;
  const pendingRequests = getPendingRequests();

  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        reject(new Error("Bridge fetch timed out"));
      }
    }, timeoutMs);

    pendingRequests.set(id, {
      resolve: (v) => {
        clearTimeout(timeout);
        resolve(v);
      },
      reject: (e) => {
        clearTimeout(timeout);
        reject(e);
      },
    });

    window.ReactNativeWebView?.postMessage(
      JSON.stringify({
        type: "bridge-fetch",
        id,
        url,
        options: rest,
      }),
    );
  });
}