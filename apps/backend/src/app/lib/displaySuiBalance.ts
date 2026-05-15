const displaySuiBalance = (balanceInMist: string | number | null) => {
    const balanceNum = Number(balanceInMist);
    const balanceInSui = balanceNum / 1_000_000_000;
    return balanceInSui.toFixed(3); // Display with 3 decimal places
};
export default displaySuiBalance;