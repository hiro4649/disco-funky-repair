import { createHash } from 'crypto';
import { Prisma } from '@prisma/client';
import prisma from '../db/prisma_client';
import { safeLogWarn } from '../utils/safeLogger';

const LOCK_NAMESPACE = 'funky_scheduler';
const SAFE_JOB_NAME_PATTERN = /^[a-z0-9_.:-]+$/i;
const MAX_JOB_NAME_LENGTH = 128;

export type PostgresAdvisoryJobLockResult<T> =
    | { status: 'acquired'; result: T }
    | { status: 'skipped' };

export const getPostgresAdvisoryLockKey = (jobName: string): [number, number] => {
    if (
        jobName.length === 0 ||
        jobName.length > MAX_JOB_NAME_LENGTH ||
        !SAFE_JOB_NAME_PATTERN.test(jobName)
    ) {
        throw new Error('invalid_job_lock_name');
    }

    const hash = createHash('sha256')
        .update(`${LOCK_NAMESPACE}:${jobName}`)
        .digest();

    return [hash.readInt32BE(0), hash.readInt32BE(4)];
};

export const withPostgresAdvisoryJobLock = async <T>(
    jobName: string,
    run: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<PostgresAdvisoryJobLockResult<T>> => {
    const [lockKeyOne, lockKeyTwo] = getPostgresAdvisoryLockKey(jobName);

    return prisma.$transaction(async (tx) => {
        const lockRows = await tx.$queryRaw<Array<{ acquired: boolean }>>`
            SELECT pg_try_advisory_xact_lock(${lockKeyOne}, ${lockKeyTwo}) AS acquired
        `;

        if (lockRows[0]?.acquired !== true) {
            safeLogWarn('distributed_job_lock_skipped', new Error('advisory_lock_busy'), {
                jobName
            });

            return { status: 'skipped' };
        }

        const result = await run(tx);
        return { status: 'acquired', result };
    });
};
