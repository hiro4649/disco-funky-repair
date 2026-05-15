import { randomInt } from 'crypto';

/**
 * Generates a random alphanumeric ticket code with CSPRNG.
 */
export const generateRandomCode = (length = 10): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        result += characters.charAt(randomInt(characters.length));
    }

    return result;
};
