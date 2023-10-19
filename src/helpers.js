export const byResolution = (cameraA, cameraB) => (cameraA.width.max > cameraB.width.max) && (cameraA.height.max > cameraB.height.max) ? cameraA : cameraB;

