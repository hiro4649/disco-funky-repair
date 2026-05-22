import fs from 'fs';
import path from 'path';
import {
  cryptoPrizeDrawRandomInt,
  selectPrizeDrawWinner
} from '../prizeDrawRng';

const candidate = (
  id: number,
  probability: number,
  real_probability: number
) => ({
  id,
  probability,
  real_probability
});

describe('prizeDrawRng', () => {
  it('keeps prize draw source free of the unsafe random call and routes controller selection through the helper', () => {
    const unsafeRandomCall = 'Math' + '.random';
    const controllerSource = fs.readFileSync(
      path.resolve(__dirname, '../../controllers/prize.controller.ts'),
      'utf8'
    );
    const helperSource = fs.readFileSync(
      path.resolve(__dirname, '../prizeDrawRng.ts'),
      'utf8'
    );

    expect(controllerSource).not.toContain(unsafeRandomCall);
    expect(helperSource).not.toContain(unsafeRandomCall);
    expect(controllerSource).toContain('selectPrizeDrawWinner');
    expect(helperSource).toContain('crypto.randomInt');
  });

  it('uses crypto.randomInt as the draw RNG source', () => {
    expect(cryptoPrizeDrawRandomInt(1)).toBe(0);
  });

  it('rejects invalid RNG ranges before drawing', () => {
    expect(() => cryptoPrizeDrawRandomInt(0)).toThrow('Invalid prize draw range');
    expect(() => cryptoPrizeDrawRandomInt(1.5)).toThrow('Invalid prize draw range');
  });

  it('keeps the highest probability candidate without drawing a tie-break value', () => {
    const rng = jest.fn();
    const winner = selectPrizeDrawWinner([
      candidate(1, 20, 10),
      candidate(2, 50, 99),
      candidate(3, 40, 1)
    ], rng);

    expect(winner?.id).toBe(2);
    expect(rng).not.toHaveBeenCalled();
  });

  it('keeps the lower real_probability tie-break when probability is tied', () => {
    const rng = jest.fn();
    const winner = selectPrizeDrawWinner([
      candidate(1, 50, 20),
      candidate(2, 50, 5),
      candidate(3, 30, 1)
    ], rng);

    expect(winner?.id).toBe(2);
    expect(rng).not.toHaveBeenCalled();
  });

  it('selects complete ties at the min, boundary, and max RNG values', () => {
    const candidates = [
      candidate(1, 50, 5),
      candidate(2, 50, 5),
      candidate(3, 50, 5)
    ];

    expect(selectPrizeDrawWinner(candidates, () => 0)?.id).toBe(1);
    expect(selectPrizeDrawWinner(candidates, () => 1)?.id).toBe(2);
    expect(selectPrizeDrawWinner(candidates, () => 2)?.id).toBe(3);
  });

  it('passes the exact complete-tie candidate count to the RNG source', () => {
    const rng = jest.fn().mockReturnValue(1);
    const winner = selectPrizeDrawWinner([
      candidate(1, 50, 5),
      candidate(2, 50, 5),
      candidate(3, 40, 1)
    ], rng);

    expect(winner?.id).toBe(2);
    expect(rng).toHaveBeenCalledWith(2);
  });

  it('rejects out-of-range injected RNG values', () => {
    expect(() => selectPrizeDrawWinner([
      candidate(1, 50, 5),
      candidate(2, 50, 5)
    ], () => 2)).toThrow('Invalid prize draw RNG value');
  });
});
