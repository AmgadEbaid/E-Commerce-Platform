
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { RpcException } from '@nestjs/microservices';
import { User } from '../../entities/user.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userId:string,createProductDto: CreateProductDto): Promise<Product> {
    console.log(userId)
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new RpcException('User not found');
    }
    const product = this.productRepository.create({ ...createProductDto, user });
    return this.productRepository.save(product);
  }

  async findAll(query: QueryProductDto): Promise<{ products: Product[]; total: number }> {
    const take = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * take;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (query.category) {
      queryBuilder.where('product.categoryId = :categoryId', { categoryId: query.category });
    }

    queryBuilder.skip(skip).take(take);

    const [products, total] = await queryBuilder.getManyAndCount();
    return { products, total };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new RpcException('Product not found');
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['user'] });
    if (!product) {
      throw new RpcException('Product not found');
    }
    if (product.user.id !== userId) {
      throw new RpcException('Unauthorized: You do not own this product');
    }
    await this.productRepository.update(id, updateProductDto);
    const updatedProduct = await this.productRepository.findOneBy({ id });
    if (!updatedProduct) {
      throw new RpcException('Product not found after update');
    }
    return updatedProduct;
  }

  async remove(id: string, userId: string): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['user'] });
    if (!product) {
      throw new RpcException('Product not found');
    }
    if (product.user.id !== userId) {
      throw new RpcException('Unauthorized: You do not own this product');
    }
    await this.productRepository.delete(id);
  }

  async search(query: QueryProductDto): Promise<{ products: Product[]; total: number }> {
    console.log(query)
    const take = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * take;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (query.searchParam) {
      queryBuilder.where(
        'product.name LIKE :searchParam OR product.description LIKE :searchParam',
        { searchParam: `%${query.searchParam}%` },
      );
    }

    if (query.category) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId: query.category });
    }

    if (query.minPrice) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice: query.minPrice });
    }

    if (query.maxPrice) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice: query.maxPrice });
    }

    queryBuilder.skip(skip).take(take);

    const [products, total] = await queryBuilder.getManyAndCount();
    return { products, total };
  }
}
