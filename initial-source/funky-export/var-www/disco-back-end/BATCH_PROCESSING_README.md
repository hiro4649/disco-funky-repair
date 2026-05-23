# Batch Token Balance Processing

This document explains how to use the new batch processing solution for efficiently handling large numbers of token balance requests while respecting Sui RPC rate limits.

## Overview

The batch processing solution allows you to process thousands of wallet addresses efficiently by:
- Processing addresses in chunks to avoid overwhelming the RPC
- Implementing automatic retry logic for failed requests
- Respecting rate limits (100 requests/minute for public RPC)
- Providing detailed logging and error handling

## Key Components

### 1. Core Functions (`getToken.ts`)

- **`getTokenBalance(walletAddress, coinType)`** - Original single address function
- **`getBatchTokenBalances(walletAddresses, coinType)`** - Basic batch processing
- **`getBatchTokenBalancesWithRetry(walletAddresses, coinType, maxRetries, retryDelay)`** - Enhanced batch processing with retry logic

### 2. Utility Class (`batchTokenProcessor.ts`)

- **`BatchTokenProcessor`** - Main class for managing batch operations
- **`createBatchProcessor()`** - Factory function
- **`quickBatchProcess()`** - Simple one-liner for basic use cases

## Usage Examples

### Basic Batch Processing

```typescript
import { getBatchTokenBalancesWithRetry } from './lib/getToken';

const walletAddresses = ['0x123...', '0x456...', '0x789...'];
const coinType = '0x1512fbf99602795c86a2a50bef34d1d6774bb1274cdc6cc21d2af0d6ea11aec9::disco::DISCO';

const results = await getBatchTokenBalancesWithRetry(
    walletAddresses,
    coinType,
    3,    // max retries
    1000  // retry delay (ms)
);

console.log(`Processed ${results.length} addresses`);
results.forEach(result => {
    if (result.error) {
        console.error(`${result.address}: ${result.error}`);
    } else {
        console.log(`${result.address}: ${result.balance}`);
    }
});
```

### Using the Utility Class

```typescript
import { BatchTokenProcessor } from './lib/batchTokenProcessor';

// Create processor with custom settings
const processor = new BatchTokenProcessor(
    '0x1512fbf99602795c86a2a50bef34d1d6774bb1274cdc6cc21d2af0d6ea11aec9::disco::DISCO',
    5,     // max retries
    2000,  // retry delay
    50     // chunk size
);

// Process large batch
const walletAddresses = [/* 10,000+ addresses */];
const result = await processor.processBatch(walletAddresses);

console.log(`Statistics:`, result.statistics);
console.log(`Success rate: ${(result.statistics.successful / result.statistics.total * 100).toFixed(2)}%`);
```

### Quick Processing

```typescript
import { quickBatchProcess } from './lib/batchTokenProcessor';

const walletAddresses = [/* addresses */];
const result = await quickBatchProcess(walletAddresses);
```

## Performance Characteristics

### Rate Limits
- **Public RPC**: 100 requests/minute
- **Dedicated Providers**: 100,000+ requests/minute

### Processing Times (Estimated)
- **1,000 addresses**: ~10-15 minutes (public RPC)
- **10,000 addresses**: ~2-3 hours (public RPC)
- **100,000 addresses**: ~20-30 hours (public RPC)

### Chunk Sizes
- **Public RPC**: 30-50 addresses per chunk
- **Dedicated Providers**: 100-200 addresses per chunk

## Configuration Options

### BatchTokenProcessor Constructor

```typescript
new BatchTokenProcessor(
    coinType,      // Token type to check
    maxRetries,    // Maximum retry attempts (default: 3)
    retryDelay,    // Delay between retries in ms (default: 1000)
    chunkSize      // Addresses per chunk (default: 30)
)
```

### Retry Logic

- **Exponential Backoff**: Delay increases with each retry
- **Configurable Limits**: Set maximum retries and delay
- **Error Tracking**: Monitor which addresses fail and why

## Error Handling

### Common Error Types

1. **Rate Limit Errors**: Automatic retry with delays
2. **Network Errors**: Retry with exponential backoff
3. **Invalid Addresses**: Validation before processing
4. **RPC Failures**: Fallback to alternative endpoints

### Error Recovery

```typescript
const processor = new BatchTokenProcessor();
const { valid, invalid } = processor.validateAddresses(walletAddresses);

if (invalid.length > 0) {
    console.warn(`Found ${invalid.length} invalid addresses:`, invalid);
}

// Process only valid addresses
const results = await processor.processBatch(valid);
```

## Monitoring and Logging

### Built-in Logging

- Processing progress and chunk information
- Success/failure statistics
- Retry attempts and delays
- Performance metrics

### Custom Monitoring

```typescript
const processor = new BatchTokenProcessor();
const startTime = Date.now();

const result = await processor.processBatch(walletAddresses);

const duration = Date.now() - startTime;
const estimatedTime = processor.estimateProcessingTime(walletAddresses.length);

console.log(`Actual time: ${duration}ms, Estimated: ${estimatedTime}ms`);
console.log(`Performance: ${(estimatedTime / duration * 100).toFixed(2)}% of estimate`);
```

## Best Practices

### 1. Choose Appropriate Chunk Sizes
- **Small chunks (20-30)**: Better reliability, slower processing
- **Large chunks (50-100)**: Faster processing, higher failure risk

### 2. Set Reasonable Retry Limits
- **Public RPC**: 3-5 retries
- **Dedicated Providers**: 2-3 retries

### 3. Monitor Rate Limits
- Use delays between chunks
- Implement exponential backoff
- Consider upgrading to dedicated RPC for high volume

### 4. Handle Failures Gracefully
- Log all errors for debugging
- Implement fallback strategies
- Retry failed addresses separately

## Migration from Single Processing

### Before (Single Processing)
```typescript
// Old way - processes one at a time
for (const user of users) {
    const balance = await getTokenBalance(user.wallet_address, coinType);
    // Process balance...
}
```

### After (Batch Processing)
```typescript
// New way - processes in batches
const walletAddresses = users.map(u => u.wallet_address);
const batchResults = await getBatchTokenBalancesWithRetry(walletAddresses, coinType);

// Create lookup map
const balanceMap = new Map();
batchResults.forEach(result => {
    if (!result.error) {
        balanceMap.set(result.address, result.balance);
    }
});

// Process users with batch results
for (const user of users) {
    const balance = balanceMap.get(user.wallet_address) || BigInt(0);
    // Process balance...
}
```

## Troubleshooting

### Common Issues

1. **Rate Limit Errors**: Increase delays between chunks
2. **Memory Issues**: Reduce chunk size
3. **Timeout Errors**: Increase retry delays
4. **Network Failures**: Check RPC endpoint availability

### Debug Mode

```typescript
// Enable verbose logging
const processor = new BatchTokenProcessor();
processor.processBatch(walletAddresses).catch(error => {
    console.error('Batch processing failed:', error);
    console.error('Stack trace:', error.stack);
});
```

## Future Enhancements

- **Parallel Processing**: Multiple RPC endpoints
- **Caching Layer**: Redis integration for repeated requests
- **Load Balancing**: Distribute requests across multiple providers
- **Real-time Monitoring**: WebSocket updates for progress tracking

## Support

For issues or questions about batch processing:
1. Check the logs for detailed error information
2. Verify RPC endpoint availability
3. Adjust chunk sizes and retry settings
4. Consider upgrading to dedicated RPC provider for high volume
