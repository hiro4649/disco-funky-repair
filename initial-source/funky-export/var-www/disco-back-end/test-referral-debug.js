const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugReferralSystem() {
    try {
        console.log('=== DISCO Referral System Debug ===\n');

        // 1. Check all referral codes
        console.log('1. Referral Codes:');
        const referralCodes = await prisma.referralCode.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        wallet_address: true,
                        createdAt: true
                    }
                }
            }
        });
        
        referralCodes.forEach(code => {
            console.log(`   - User ${code.user.id} (${code.user.wallet_address}): ${code.code}`);
        });

        // 2. Check all referral history
        console.log('\n2. Referral History:');
        const referrals = await prisma.referralHistory.findMany({
            include: {
                referrer: {
                    select: {
                        id: true,
                        wallet_address: true
                    }
                },
                referredUser: {
                    select: {
                        id: true,
                        wallet_address: true,
                        createdAt: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        referrals.forEach(ref => {
            const timeSinceFirstLogin = Date.now() - ref.timestampFirstLogin.getTime();
            const hoursSinceFirstLogin = Math.floor(timeSinceFirstLogin / (1000 * 60 * 60));
            const isEligible = hoursSinceFirstLogin >= 24;
            
            console.log(`   - Referral ${ref.id}: ${ref.referrer.wallet_address} -> ${ref.referredUser.wallet_address}`);
            console.log(`     Code: ${ref.referralCode}, Rewarded: ${ref.rewarded}, Hours since first login: ${hoursSinceFirstLogin}`);
            console.log(`     Eligible for bonus: ${isEligible ? 'YES' : 'NO (need 24h)'}`);
        });

        // 3. Check token balances for referred users
        console.log('\n3. Token Balances for Referred Users:');
        for (const ref of referrals) {
            const userToken = await prisma.ownedToken.findFirst({
                where: { userId: ref.referredUserId }
            });

            if (userToken) {
                const hasEnoughTokens = userToken.tallyTokenBalance >= 10000;
                console.log(`   - User ${ref.referredUserId} (${ref.referredUser.wallet_address}):`);
                console.log(`     Current balance: ${userToken.tallyTokenBalance} DISCO`);
                console.log(`     Has 10,000+ tokens: ${hasEnoughTokens ? 'YES' : 'NO'}`);
                console.log(`     Meets requirements: ${hasEnoughTokens && (Date.now() - ref.timestampFirstLogin.getTime() >= 24 * 60 * 60 * 1000) ? 'YES' : 'NO'}`);
            } else {
                console.log(`   - User ${ref.referredUserId} (${ref.referredUser.wallet_address}): No token record found`);
            }
        }

        // 4. Check cron job status
        console.log('\n4. Cron Job Status:');
        console.log('   - Referral bonus check runs every 6 hours (0 */6 * * *)');
        console.log('   - Next run should be at: 00:00, 06:00, 12:00, 18:00 UTC');

        // 5. Summary
        console.log('\n5. Summary:');
        const pendingReferrals = referrals.filter(r => !r.rewarded);
        const eligibleReferrals = pendingReferrals.filter(ref => {
            const userToken = referrals.find(r => r.id === ref.id)?.referredUser;
            if (!userToken) return false;
            
            const timeSinceFirstLogin = Date.now() - ref.timestampFirstLogin.getTime();
            return timeSinceFirstLogin >= 5 * 60 * 1000;
        });

        console.log(`   - Total referrals: ${referrals.length}`);
        console.log(`   - Pending referrals: ${pendingReferrals.length}`);
        console.log(`   - Eligible for bonus: ${eligibleReferrals.length}`);
        console.log(`   - Already rewarded: ${referrals.filter(r => r.rewarded).length}`);

    } catch (error) {
        console.error('Error debugging referral system:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the debug function
debugReferralSystem();
