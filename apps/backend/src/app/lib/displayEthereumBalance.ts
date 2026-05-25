const DISPLAY_DECIMALS = 6;
const DISPLAY_SCALE = 10n ** BigInt(DISPLAY_DECIMALS);

const parseBaseUnitBalance = (balanceInWei: string | number | bigint): bigint | null => {
    if (typeof balanceInWei === 'bigint') {
        return balanceInWei >= 0n ? balanceInWei : null;
    }

    if (typeof balanceInWei === 'number') {
        if (!Number.isSafeInteger(balanceInWei) || balanceInWei < 0) {
            return null;
        }
        return BigInt(balanceInWei);
    }

    const normalized = balanceInWei.trim();
    if (!/^\d+$/.test(normalized)) {
        return null;
    }
    return BigInt(normalized);
};

const displayEthereumBalance = (balanceInWei: string | number | bigint | null, decimals: number = 18) => {
    if (balanceInWei === null || balanceInWei === undefined) {
        return '0';
    }

    if (!Number.isInteger(decimals) || decimals < 0) {
        return '0';
    }

    const balance = parseBaseUnitBalance(balanceInWei);
    if (balance === null) {
        return '0';
    }

    const scaledBalance = decimals >= DISPLAY_DECIMALS
        ? (balance + (10n ** BigInt(decimals - DISPLAY_DECIMALS)) / 2n) / (10n ** BigInt(decimals - DISPLAY_DECIMALS))
        : balance * (10n ** BigInt(DISPLAY_DECIMALS - decimals));

    const whole = scaledBalance / DISPLAY_SCALE;
    const fraction = (scaledBalance % DISPLAY_SCALE).toString().padStart(DISPLAY_DECIMALS, '0');
    return `${whole.toString()}.${fraction}`;
};

export default displayEthereumBalance;
