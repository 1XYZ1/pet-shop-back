import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, FindProductsQueryDto } from './dto';

import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/interfaces';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Auth()
  @ApiResponse({
    status: 201,
    description: 'Product was created',
    type: Product,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden. Token related.' })
  create(@Body() createProductDto: CreateProductDto, @GetUser() user: User) {
    return this.productsService.create(createProductDto, user);
  }

  /**
   * Obtiene una lista paginada de productos con filtros opcionales avanzados
   * Permite búsqueda por texto, filtrar por tipo de producto, especie, tallas y rango de precios
   * @param queryDto - Parámetros de filtrado y paginación
   * @returns Lista de productos filtrados con metadata de paginación
   */
  @Get()
  @ApiResponse({
    status: 200,
    description: 'Lista de productos filtrados por tipo, especie y otros criterios',
  })
  @ApiResponse({ status: 400, description: 'Parámetros de consulta inválidos' })
  findAll(@Query() queryDto: FindProductsQueryDto) {
    return this.productsService.findAllFiltered(queryDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.productsService.findOnePlain(term);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User,
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
