import crypto from 'crypto';

export type PrizeDrawRandomInt = (maxExclusive: number) => number;

export type PrizeDrawCandidate = {
    probability: number;
    real_probability: number;
};

export const cryptoPrizeDrawRandomInt: PrizeDrawRandomInt = (maxExclusive: number): number => {
    if (!Number.isSafeInteger(maxExclusive) || maxExclusive <= 0) {
        throw new Error('Invalid prize draw range');
    }

    return crypto.randomInt(maxExclusive);
};

const hasHigherPrizeDrawPriority = (
    current: PrizeDrawCandidate,
    best: PrizeDrawCandidate
): boolean => (
    current.probability > best.probability ||
    (current.probability === best.probability && current.real_probability < best.real_probability)
);

const hasSamePrizeDrawPriority = (
    current: PrizeDrawCandidate,
    best: PrizeDrawCandidate
): boolean => (
    current.probability === best.probability &&
    current.real_probability === best.real_probability
);

export const selectPrizeDrawWinner = <T extends PrizeDrawCandidate>(
    candidates: readonly T[],
    randomIntSource: PrizeDrawRandomInt = cryptoPrizeDrawRandomInt
): T | null => {
    const bestCandidates: T[] = [];

    for (const current of candidates) {
        const best = bestCandidates[0];
        if (!best || hasHigherPrizeDrawPriority(current, best)) {
            bestCandidates.length = 0;
            bestCandidates.push(current);
            continue;
        }

        if (hasSamePrizeDrawPriority(current, best)) {
            bestCandidates.push(current);
        }
    }

    if (bestCandidates.length === 0) {
        return null;
    }

    const winningIndex = bestCandidates.length === 1
        ? 0
        : randomIntSource(bestCandidates.length);

    if (!Number.isSafeInteger(winningIndex) || winningIndex < 0 || winningIndex >= bestCandidates.length) {
        throw new Error('Invalid prize draw RNG value');
    }

    return bestCandidates[winningIndex] ?? null;
};
