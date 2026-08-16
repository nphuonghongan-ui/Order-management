export async function withRetry(fn, { attempts = 4, baseDelayMs = 100 } = {}) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (err && err.code === 11000) throw err;
      if (err && err.name === 'ValidationError') throw err;
      if (i === attempts - 1) throw err;
      const delay = baseDelayMs * Math.pow(2, i);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastErr;
}
