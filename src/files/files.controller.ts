import {
  Controller,
  Get,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Res,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';

import { fileFilter, fileNamer, petImageFilter } from './helpers';
import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';

@ApiTags('Files - Get and Upload')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string,
  ) {
    const path = this.filesService.getStaticProductImage(imageName);

    res.sendFile(path);
  }

  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      // limits: { fileSize: 1000 }
      storage: diskStorage({
        destination: './static/products',
        filename: fileNamer,
      }),
    }),
  )
  uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Make sure that the file is an image');
    }

    // const secureUrl = `${ file.filename }`;
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${
      file.filename
    }`;

    return { secureUrl, fileName: file.filename };
  }

  @Get('pet/:imageName')
  @ApiResponse({
    status: 200,
    description: 'Pet profile image retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Image not found',
  })
  findPetImage(
    @Res() res: Response,
    @Param('imageName') imageName: string,
  ) {
    const path = this.filesService.getStaticPetImage(imageName);
    res.sendFile(path);
  }

  @Post('pet/:petId')
  @Auth()
  @ApiResponse({
    status: 201,
    description: 'Pet profile image uploaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: petImageFilter,
      storage: diskStorage({
        destination: './static/pets',
        filename: fileNamer,
      }),
    }),
  )
  uploadPetImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('petId', ParseUUIDPipe) petId: string,
    @GetUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException('Make sure that the file is an image');
    }

    const secureUrl = `${this.configService.get('HOST_API')}/files/pet/${
      file.filename
    }`;

    return {
      secureUrl,
      fileName: file.filename,
      petId
    };
  }
}
