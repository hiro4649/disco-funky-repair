function isValidSuiAddress(address: string): boolean {
    // Sui addresses are 32 bytes (64 characters) long, prefixed with "0x"
    const suiAddressRegex = /^0x[a-fA-F0-9]{64}$/;
    return suiAddressRegex.test(address);
}

export { isValidSuiAddress };