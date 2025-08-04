
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { RpcException } from '@nestjs/microservices';
import { User } from '../../entities/user.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const user = await this.userRepository.findOneBy({ id: createCategoryDto.userId });
    if (!user) {
      throw new RpcException('User not found');
    }
    const category = this.categoryRepository.create({ ...createCategoryDto, user });
    return this.categoryRepository.save(category);
  }

  async findAll(query: QueryCategoryDto): Promise<{ categories: Category[]; total: number }> {
    const take = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * take;

    const options: FindManyOptions<Category> = {
      take,
      skip,
    };

    const [categories, total] = await this.categoryRepository.findAndCount(options);
    return { categories, total };
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new RpcException('Category not found');
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, userId: string) {
    const category = await this.categoryRepository.findOne({ where: { id }, relations: ['user'] });
    if (!category) {
      throw new RpcException('Category not found');
    }
    if (category.user.id !== userId) {
      throw new RpcException('Unauthorized: You do not own this category');
    }
    await this.categoryRepository.update(id, updateCategoryDto);
    return this.categoryRepository.findOneBy({ id });
  }

  async remove(id: string, userId: string): Promise<void> {
    const category = await this.categoryRepository.findOne({ where: { id }, relations: ['user'] });
    if (!category) {
      throw new RpcException('Category not found');
    }
    if (category.user.id !== userId) {
      throw new RpcException('Unauthorized: You do not own this category');
    }
    await this.categoryRepository.delete(id);
  }
}
