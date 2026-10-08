export function isDefiniteRefreshRejection(error) {
  if (error?.status === 401) return true;
  const code = String(error?.code || "").toLowerCase();
  const message = String(error?.message || "").toLowerCase();
  return /(invalid|revoked|expired)/.test(`${code} ${message}`);
}

export function isRetryableRefreshError(error) {
  return (
    error?.status >= 500 ||
    error?.code === "NETWORK_ERROR" ||
    error?.code === "TIMEOUT" ||
    error?.name === "TypeError"
  );
}

export function createRefreshCore({
  getRefreshToken,
  getAccessToken,
  setTokens,
  clearTokens,
  requestRefresh,
  withLock = (callback) => callback(),
  waitForRotatedAccess,
  wait = (milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds)),
  onRejected = () => {},
}) {
  let refreshPromise = null;
  let bootstrapPromise = null;

  const rejectSession = () => {
    try {
      clearTokens();
    } finally {
      onRejected();
    }
  };

  async function refresh() {
    if (refreshPromise) return refreshPromise;

    const operation = (async () => {
      const originalRefreshToken = getRefreshToken();
      if (!originalRefreshToken) {
        const error = new Error("No refresh token is available.");
        error.code = "NO_REFRESH_TOKEN";
        throw error;
      }

      return withLock(async () => {
        const currentRefreshToken = getRefreshToken();
        if (!currentRefreshToken) {
          const error = new Error("The refresh token is no longer available.");
          error.status = 401;
          error.code = "REFRESH_TOKEN_REJECTED";
          rejectSession();
          throw error;
        }

        if (currentRefreshToken !== originalRefreshToken) {
          const rotatedAccessToken =
            getAccessToken(currentRefreshToken) ||
            (waitForRotatedAccess
              ? await waitForRotatedAccess(currentRefreshToken)
              : null);
          if (rotatedAccessToken) return rotatedAccessToken;
        }

        for (let attempt = 0; attempt < 3; attempt += 1) {
          try {
            const result = await requestRefresh(currentRefreshToken);
            if (
              result?.success === false ||
              !result?.accessToken ||
              !result?.refreshToken
            ) {
              const error = new Error(
                result?.error || "The refresh response did not include valid tokens."
              );
              error.status = result?.status;
              error.code = result?.code || "INVALID_REFRESH_RESPONSE";
              throw error;
            }

            setTokens({
              accessToken: result.accessToken,
              refreshToken: result.refreshToken,
            });
            return result.accessToken;
          } catch (error) {
            if (isDefiniteRefreshRejection(error)) {
              rejectSession();
              throw error;
            }
            if (!isRetryableRefreshError(error) || attempt === 2) throw error;
            await wait(250 * (attempt + 1));
          }
        }

        throw new Error("Refresh retries were exhausted.");
      });
    })();

    refreshPromise = operation;
    try {
      return await operation;
    } finally {
      if (refreshPromise === operation) refreshPromise = null;
    }
  }

  function bootstrap(loadAuthenticatedSession) {
    if (bootstrapPromise) return bootstrapPromise;

    const operation = (async () => {
      if (!getRefreshToken()) {
        return { status: "unauthenticated", value: null };
      }
      const accessToken = await refresh();
      const value = await loadAuthenticatedSession(accessToken);
      return { status: "authenticated", value };
    })();

    bootstrapPromise = operation;
    void operation.finally(() => {
      if (bootstrapPromise === operation) bootstrapPromise = null;
    }).catch(() => {});
    return operation;
  }

  async function retryAfterUnauthorized(replayRequest) {
    const accessToken = await refresh();
    try {
      return await replayRequest(accessToken);
    } catch (error) {
      if (error?.status === 401) rejectSession();
      throw error;
    }
  }

  return { refresh, bootstrap, retryAfterUnauthorized };
}
