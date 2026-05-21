import { createMultipleImageUploadMiddleware } from './imageUploadSecurity';

const uploadMultipleImages = createMultipleImageUploadMiddleware('files', 10);

export default uploadMultipleImages;
