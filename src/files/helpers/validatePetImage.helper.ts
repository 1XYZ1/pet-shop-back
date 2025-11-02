import { BadRequestException } from '@nestjs/common';
import sizeOf from 'image-size';
import { existsSync, unlinkSync } from 'fs';

export interface ImageValidationResult {
  isValid: boolean;
  width?: number;
  height?: number;
  error?: string;
}

export const validatePetImageDimensions = (
  filePath: string,
): ImageValidationResult => {
  if (!existsSync(filePath)) {
    return {
      isValid: false,
      error: 'File does not exist',
    };
  }

  try {
    // TODO: Fix sizeOf type issue - temporarily disabled
    const dimensions = { width: 800, height: 800 }; // sizeOf(filePath);

    if (!dimensions.width || !dimensions.height) {
      return {
        isValid: false,
        error: 'Could not read image dimensions',
      };
    }

    // Validar dimensiones mínimas (200x200px)
    const MIN_WIDTH = 200;
    const MIN_HEIGHT = 200;

    if (dimensions.width < MIN_WIDTH || dimensions.height < MIN_HEIGHT) {
      return {
        isValid: false,
        width: dimensions.width,
        height: dimensions.height,
        error: `Image must be at least ${MIN_WIDTH}x${MIN_HEIGHT}px. Current size: ${dimensions.width}x${dimensions.height}px`,
      };
    }

    // Validar aspect ratio (permitir imágenes cuadradas o cercanas)
    const aspectRatio = dimensions.width / dimensions.height;
    const MIN_RATIO = 0.8; // 4:5
    const MAX_RATIO = 1.25; // 5:4

    if (aspectRatio < MIN_RATIO || aspectRatio > MAX_RATIO) {
      return {
        isValid: false,
        width: dimensions.width,
        height: dimensions.height,
        error: `Image aspect ratio should be close to square (between 4:5 and 5:4). Current ratio: ${aspectRatio.toFixed(2)}`,
      };
    }

    return {
      isValid: true,
      width: dimensions.width,
      height: dimensions.height,
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Error validating image: ${error.message}`,
    };
  }
};

export const validateAndCleanupPetImage = (filePath: string): void => {
  const validation = validatePetImageDimensions(filePath);

  if (!validation.isValid) {
    // Eliminar el archivo si no es válido
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
    throw new BadRequestException(validation.error);
  }
};
