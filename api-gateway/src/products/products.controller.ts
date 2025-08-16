import {
  Controller,
  Inject,
  Post,
  Body,
  Get,
  Query,
  Request,
  Param,
  Patch,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from '@nestjs/passport';
import { VerifiedGuard } from 'src/auth/guards/verified.guard';
import { UpdatePayloadDto } from './dto/update-payload.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { vercelBlob } from 'src/vercelBlob/vercelBlob.service';
import { UserRole } from 'src/entities/user.entity';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('products')
@UseGuards(AuthGuard('jwt'), VerifiedGuard)
export class ProductsController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    private readonly vercelblob: vercelBlob,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor('files', 5))
  async create(
    @Body() createProductDto: CreateProductDto,
    @Request() req,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|pdf)' }),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    const UserId = req.user.id;
    const imagesUrls = await this.vercelblob.uploadMultipleFiles(files);
    createProductDto.images = imagesUrls;
    return this.natsClient.send(
      { cmd: 'create_product' },
      { UserId, createProductDto },
    );
  }

  @Get('search')
  search(@Query() query: QueryProductDto) {
    return this.natsClient.send({ cmd: 'search_products' }, query);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    console.log('update here');
    const userId = req.user.id;
    const update_Payload: UpdatePayloadDto = {
      id,
      updateProductDto,
      userId,
    };
    console.log(update_Payload);
    return this.natsClient.send({ cmd: 'update_product' }, update_Payload);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return this.natsClient.send({ cmd: 'delete_product' }, { id, userId });
  }

  @Get()
  findAll(@Query() query: QueryProductDto) {
    return this.natsClient.send({ cmd: 'get_all_products' }, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.natsClient.send({ cmd: 'get_product' }, id);
  }
}
