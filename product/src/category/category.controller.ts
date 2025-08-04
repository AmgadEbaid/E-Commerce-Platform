
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { UpdateCategoryPayloadDto } from './dto/update-category-payload.dto';

@Controller()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @MessagePattern({ cmd: 'create_category' })
  create(@Payload() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @MessagePattern({ cmd: 'get_all_categories' })
  findAll(@Payload() query: QueryCategoryDto) {
    return this.categoryService.findAll(query);
  }

  @MessagePattern({ cmd: 'get_category' })
  findOne(@Payload() id: string) {
    return this.categoryService.findOne(id);
  }

  @MessagePattern({ cmd: 'update_category' })
  update(@Payload() updateCategoryPayloadDto: UpdateCategoryPayloadDto) {
    return this.categoryService.update(updateCategoryPayloadDto.id, updateCategoryPayloadDto.updateCategoryDto, updateCategoryPayloadDto.userId);
  }

  @MessagePattern({ cmd: 'delete_category' })
  remove(@Payload() data: { id: string; userId: string }) {
    return this.categoryService.remove(data.id, data.userId);
  }
}
