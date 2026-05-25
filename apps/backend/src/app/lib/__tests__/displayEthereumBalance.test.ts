import displayEthereumBalance from '../displayEthereumBalance';

describe('displayEthereumBalance precision', () => {
  it('formats base-unit balances above Number.MAX_SAFE_INTEGER without rounding the integer part', () => {
    expect(displayEthereumBalance('9007199254740993', 0)).toBe('9007199254740993.000000');
  });

  it('formats bigint base-unit balances without converting through Number', () => {
    expect(displayEthereumBalance(9007199254740993n, 18)).toBe('0.009007');
  });
});
