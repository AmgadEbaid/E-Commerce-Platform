
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdatePayloadDto } from './dto/update-payload.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { CreateProductPayloadDto } from './dto/create-product-payload';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @MessagePattern({ cmd: 'create_product' })
  create(@Payload() CreateProductPayload: CreateProductPayloadDto) {
    const { UserId, createProductDto } = CreateProductPayload;
    return this.productService.create(UserId, createProductDto);
  }

  @MessagePattern({ cmd: 'get_all_products' })
  findAll(@Payload() query: QueryProductDto) {
    return this.productService.findAll(query);
  }

  @MessagePattern({ cmd: 'get_product' })
  findOne(@Payload() id: string) {
    return this.productService.findOne(id);
  }

  @MessagePattern({ cmd: 'update_product' })
  update(@Payload() updatePayloadDto: UpdatePayloadDto) {
    return this.productService.update(updatePayloadDto.id, updatePayloadDto.updateProductDto, updatePayloadDto.userId);
  }

  @MessagePattern({ cmd: 'delete_product' })
  remove(@Payload() data: { id: string; userId: string }) {
    return this.productService.remove(data.id, data.userId);
  }

  @MessagePattern({ cmd: 'search_products' })
  search(@Payload() query: QueryProductDto) {
    return this.productService.search(query);
  }
}
