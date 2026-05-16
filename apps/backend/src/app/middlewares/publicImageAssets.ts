import path from 'path';
import type { RequestHandler } from 'express';

export const PUBLIC_IMAGE_ASSET_EXTENSIONS = [
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.webp',
    '.svg'
] as const;

const publicImageAssetExtensions = new Set<string>(
    PUBLIC_IMAGE_ASSET_EXTENSIONS
);

export const isPublicImageAssetRequestPath = (requestPath: string): boolean => {
    return publicImageAssetExtensions.has(
        path.extname(requestPath).toLowerCase()
    );
};

export const rejectNonImageStaticAsset: RequestHandler = (req, res, next) => {
    if (!isPublicImageAssetRequestPath(req.path)) {
        res.status(404).end();
        return;
    }

    next();
};
