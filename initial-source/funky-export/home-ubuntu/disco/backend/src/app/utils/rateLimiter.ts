/**
 * Rate limiter for Etherscan API
 * Lite plan allows 4 requests per second
 * This ensures we never exceed that limit by serialising callers
 */

class EtherscanRateLimiter {
  private requestTimes: number[] = [];
  private readonly maxRequests = 4;
  private readonly timeWindow = 1000; // 1 second in milliseconds
  private readonly minDelay = 350; // Minimum delay between requests (1000ms / 4 = 250ms) but for safety Jacoza add 100ms
  private queue: Promise<void> = Promise.resolve();

  /**
   * Wait if necessary to respect rate limit, then record the request.
   * Calls are queued so they are processed sequentially.
   */
  async waitForRateLimit(): Promise<void> {
    this.queue = this.queue.then(() => this.acquireSlot());
    return this.queue;
  }

  /**
   * Handles the actual rate-limit checks for a single caller.
   */
  private async acquireSlot(): Promise<void> {
    let now = Date.now();

    // Remove requests older than 1 second
    this.requestTimes = this.requestTimes.filter(
      (time) => now - time < this.timeWindow
    );

    // If we have reached the max requests in the last second, wait
    if (this.requestTimes.length >= this.maxRequests) {
      const oldestRequest = this.requestTimes[0];
      const waitTime = this.timeWindow - (now - oldestRequest) + 50; // add buffer

      if (waitTime > 0) {
        await this.sleep(waitTime);
        now = Date.now();
        this.requestTimes = this.requestTimes.filter(
          (time) => now - time < this.timeWindow
        );
      }
    }

    // Ensure minimum spacing between consecutive requests
    if (this.requestTimes.length > 0) {
      const lastRequest = this.requestTimes[this.requestTimes.length - 1];
      const timeSinceLastRequest = now - lastRequest;

      if (timeSinceLastRequest < this.minDelay) {
        await this.sleep(this.minDelay - timeSinceLastRequest);
        now = Date.now();
      }
    }

    this.requestTimes.push(now);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export a singleton instance
export const etherscanRateLimiter = new EtherscanRateLimiter();

