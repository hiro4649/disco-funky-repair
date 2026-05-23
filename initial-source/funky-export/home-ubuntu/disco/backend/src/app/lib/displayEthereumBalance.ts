const displayEthereumBalance = (balanceInWei: string | number | bigint | null, decimals: number = 18) => {
    if (balanceInWei === null || balanceInWei === undefined) {
        return '0';
    }
    
    const balanceNum = typeof balanceInWei === 'bigint' ? Number(balanceInWei) : Number(balanceInWei);
    const divisor = Math.pow(10, decimals);
    const balanceInTokens = balanceNum / divisor;
    return balanceInTokens.toFixed(6); // Display with 6 decimal places
};

export default displayEthereumBalance;
