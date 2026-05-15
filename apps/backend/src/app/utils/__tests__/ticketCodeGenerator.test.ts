import { generateRandomCode } from '../ticketCodeGenerator';

describe('generateRandomCode', () => {
  it('generates a 10-character alphanumeric code by default without Math.random', () => {
    const mathRandom = jest.spyOn(Math, 'random').mockImplementation(() => {
      throw new Error('Math.random must not be used for ticket codes');
    });

    try {
      const code = generateRandomCode();

      expect(code).toHaveLength(10);
      expect(code).toMatch(/^[A-Za-z0-9]+$/);
      expect(mathRandom).not.toHaveBeenCalled();
    } finally {
      mathRandom.mockRestore();
    }
  });
});
