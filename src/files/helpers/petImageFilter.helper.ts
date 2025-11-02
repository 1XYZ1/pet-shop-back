import { BadRequestException } from '@nestjs/common';

// Validación básica de tipo de archivo (extensión)
// Las validaciones de dimensiones y aspect ratio se harán después de guardar el archivo
export const petImageFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  if (!file) return callback(new Error('File is empty'), false);

  // Validar extensión del archivo
  const fileExtension = file.mimetype.split('/')[1];
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];

  if (!validExtensions.includes(fileExtension)) {
    return callback(
      new BadRequestException(
        `Invalid file type. Allowed types: ${validExtensions.join(', ')}`,
      ),
      false,
    );
  }

  return callback(null, true);
};
