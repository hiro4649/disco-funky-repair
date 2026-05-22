import { createSingleImageUploadMiddleware } from './imageUploadSecurity';

export const uploadSingleImage = createSingleImageUploadMiddleware('image');
export const uploadSingleFile = createSingleImageUploadMiddleware('file');

export default uploadSingleImage;
