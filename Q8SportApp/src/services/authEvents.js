// Minimal pub/sub for auth-related events (keeps apiClient decoupled from React context)

const unauthorizedListeners = new Set();

export const AuthEvents = {
  onUnauthorized: (listener) => {
    unauthorizedListeners.add(listener);
    return () => unauthorizedListeners.delete(listener);
  },
  emitUnauthorized: () => {
    for (const listener of Array.from(unauthorizedListeners)) {
      try {
        listener();
      } catch (e) {
        // ignore listener errors
      }
    }
  },
};
