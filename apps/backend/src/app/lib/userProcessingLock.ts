/**
 * Per-User Processing Lock
 *
 * Ensures only one FIFO update runs per user at a time. Used to prevent race
 * conditions when the same user is processed concurrently (e.g. WebSocket
 * event and daily batch, or two Transfer events in quick succession).
 *
 * Implementation: In-memory queue per userId. Each new call waits for the
 * previous promise for that user to resolve, then runs, then resolves so the
 * next waiter can run.
 */

const userLocks = new Map<number, Promise<void>>();

/**
 * Run a function under an exclusive lock for the given user.
 * Only one execution per userId runs at a time; others wait in line.
 *
 * @param userId - User ID (used as lock key)
 * @param fn - Async work that touches this user's FIFO queue
 * @returns Result of fn()
 */
export async function withUserLock<T>(
    userId: number,
    fn: () => Promise<T>
): Promise<T> {
    const existing = userLocks.get(userId) ?? Promise.resolve();

    let resolve: () => void;
    const newLock = new Promise<void>((r) => {
        resolve = r;
    });
    userLocks.set(userId, newLock);

    try {
        await existing;
        return await fn();
    } finally {
        resolve!();
        if (userLocks.get(userId) === newLock) {
            userLocks.delete(userId);
        }
    }
}
