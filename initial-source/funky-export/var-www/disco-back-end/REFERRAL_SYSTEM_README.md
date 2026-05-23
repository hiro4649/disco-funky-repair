# DISCO Referral System Implementation

## Overview

This document describes the complete implementation of the DISCO referral system, which allows users to invite friends and earn rewards when their referrals hold 10,000 DISCO tokens for 24 hours.

## Features

### ✅ Implemented Features

1. **Referral Code Generation**
   - Unique referral codes generated for each user
   - Base64/SHA256 hash-based code generation
   - One referral code per user

2. **Referral URL System**
   - Format: `https://disco.fan/r/{referralCode}/`
   - Automatic cookie setting when users visit referral URLs
   - 7-day cookie expiration

3. **Referral Tracking**
   - Database tracking of all referrals
   - Prevention of self-referrals
   - Prevention of duplicate referrals
   - Timestamp tracking for first login

4. **Reward System**
   - 100 Fan Points for both referrer and referred user
   - Automatic reward distribution when requirements are met
   - 24-hour token holding requirement (10,000 DISCO tokens)
   - Prevention of double rewards

5. **Admin Dashboard**
   - Complete referral statistics
   - Manual reward distribution trigger
   - Referral history management

6. **Frontend Integration**
   - Real-time referral link generation
   - Copy-to-clipboard functionality
   - Referral statistics display
   - Multi-language support

## Database Schema

### New Models Added

#### `ReferralCode`
```sql
model ReferralCode {
  id           Int      @id @default(autoincrement())
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId       Int      @unique
  code         String   @unique @db.VarChar(255)
  createdAt    DateTime @default(now()) @db.Timestamp(6)
  updatedAt    DateTime @default(now()) @db.Timestamp(6)
}
```

#### `ReferralHistory`
```sql
model ReferralHistory {
  id              Int      @id @default(autoincrement())
  referrer        User     @relation("ReferredBy", fields: [referrerId], references: [id], onDelete: Cascade)
  referrerId      Int
  referredUser    User     @relation("ReferredUser", fields: [referredUserId], references: [id], onDelete: Cascade)
  referredUserId  Int
  referralCode    String   @db.VarChar(255)
  rewarded        Boolean  @default(false)
  rewardAmount    Int      @default(100)
  timestampFirstLogin DateTime @db.Timestamp(6)
  createdAt       DateTime @default(now()) @db.Timestamp(6)
  updatedAt       DateTime @default(now()) @db.Timestamp(6)

  @@unique([referrerId, referredUserId])
}
```

## API Endpoints

### User Endpoints

#### `GET /api/referral/code`
- **Purpose**: Generate or retrieve user's referral code
- **Authentication**: Required (JWT token)
- **Response**: 
  ```json
  {
    "success": true,
    "referralCode": "Ab3x9Y2z",
    "referralUrl": "https://disco.fan/r/Ab3x9Y2z/"
  }
  ```

#### `GET /api/referral/stats`
- **Purpose**: Get user's referral statistics
- **Authentication**: Required (JWT token)
- **Response**:
  ```json
  {
    "success": true,
    "totalReferrals": 5,
    "totalRewards": 300,
    "pendingRewards": 200,
    "referrals": [...]
  }
  ```

#### `POST /api/referral/process`
- **Purpose**: Process a new referral (called during signup)
- **Body**:
  ```json
  {
    "wallet_address": "0x...",
    "referral_code": "Ab3x9Y2z"
  }
  ```

### Admin Endpoints

#### `GET /api/admin/referral/stats`
- **Purpose**: Get all referral statistics (admin only)
- **Authentication**: Required (Admin JWT token)

#### `POST /api/admin/referral/check-bonuses`
- **Purpose**: Manually trigger referral bonus check
- **Authentication**: Required (Admin JWT token)

## Implementation Details

### Referral Code Generation
- Uses SHA256 hash of wallet address + timestamp
- Base64 encoded and truncated to 8 characters
- Ensures uniqueness and randomness

### Cookie Management
- Referral cookies set with 7-day expiration
- HttpOnly and secure flags for security
- Automatic cleanup after expiration

### Reward Distribution
- Automatic cron job runs every 6 hours
- Checks token holding requirements
- Awards 100 points to both users
- Prevents double rewards

### Security Features
- Self-referral prevention
- Duplicate referral prevention
- JWT authentication for all endpoints
- Input validation and sanitization

## Setup Instructions

### 1. Database Setup
```bash
cd disco-backend
chmod +x setup-referral-system.sh
./setup-referral-system.sh
```

### 2. Environment Variables
No additional environment variables required.

### 3. Restart Services
```bash
# Backend
npm run dev

# Frontend
npm run dev
```

## Usage Flow

### For Referrers
1. User visits `/invite-friends` page
2. System generates unique referral code
3. User copies and shares referral link
4. System tracks referrals and rewards

### For Referred Users
1. User clicks referral link
2. System sets referral cookie
3. User signs up/logs in
4. System processes referral automatically
5. Rewards awarded after 24h token holding

### For Admins
1. Access `/admin/referral/stats` for statistics
2. Use `/admin/referral/check-bonuses` for manual processing
3. Monitor referral system performance

## Cron Jobs

### Referral Bonus Check
- **Schedule**: Every 6 hours (`0 */6 * * *`)
- **Purpose**: Check and award pending referral bonuses
- **Timezone**: UTC

## Monitoring and Logging

### Log Messages
- Referral code generation
- Cookie setting
- Referral processing
- Reward distribution
- Error handling

### Error Handling
- Invalid referral codes
- Database connection issues
- Token balance check failures
- Duplicate referral attempts

## Testing

### Manual Testing
1. Generate referral code
2. Visit referral URL
3. Check cookie setting
4. Test signup process
5. Verify reward distribution

### API Testing
```bash
# Test referral code generation
curl -X GET http://localhost:5000/api/referral/code \
  -H "Cookie: userAuth=your-jwt-token"

# Test referral stats
curl -X GET http://localhost:5000/api/referral/stats \
  -H "Cookie: userAuth=your-jwt-token"
```

## Future Enhancements

### Potential Improvements
1. **Tiered Rewards**: Different reward amounts based on referral count
2. **Referral Chains**: Multi-level referral tracking
3. **Analytics Dashboard**: Detailed referral analytics
4. **Email Notifications**: Reward notification emails
5. **Social Sharing**: Direct social media integration

### Performance Optimizations
1. **Caching**: Redis caching for referral codes
2. **Batch Processing**: Bulk reward distribution
3. **Database Indexing**: Optimized queries for large datasets

## Troubleshooting

### Common Issues

#### Referral Code Not Generated
- Check user authentication
- Verify database connection
- Check Prisma client generation

#### Rewards Not Distributed
- Verify token balance requirements
- Check cron job execution
- Review error logs

#### Cookie Not Set
- Check referral URL format
- Verify middleware execution
- Check browser cookie settings

### Debug Commands
```bash
# Check Prisma client
npx prisma generate

# Check database schema
npx prisma db push

# View logs
tail -f logs/app.log
```

## Support

For technical support or questions about the referral system implementation, please refer to the development team or create an issue in the project repository. 