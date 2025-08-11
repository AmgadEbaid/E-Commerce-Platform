import {
  Body,
  ConflictException,
  Controller,
  Inject,
  Request,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Post,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDto } from './dto/update-user.dto';
import { Express } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import { VerifiedGuard } from 'src/auth/guards/verified.guard';
import { catchError, throwError } from 'rxjs';
import { AddressDto } from './dto/address.dto';
import { vercelBlob } from 'src/vercelBlob/vercelBlob.service';

@Controller('users')
export class UsersController {
  constructor(
    @Inject('NATS_SERVICE') private client: ClientProxy,
    private readonly vercelblob: vercelBlob,
  ) {}
  @Patch()
  @UseGuards(AuthGuard('jwt'), VerifiedGuard)
  @UseInterceptors(FileInterceptor('profilePicture'))
  async updateUser(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() profilePicture: Express.Multer.File,
  ) {
    const userid = req.user.id;
    const fileUrl = await this.vercelblob.uploadFile(profilePicture);
    console.log('here is api ', fileUrl);
    return this.client.send(
      { cmd: 'updateUser' },
      { userid, updateUserDto, fileUrl },
    );
  }

  @Post('Address')
  @UseGuards(AuthGuard('jwt'), VerifiedGuard)
  UpdateAddress(@Request() req, @Body() UpdateAddress: AddressDto) {
    const userId = req.user.id;
    return this.client
      .send({ cmd: 'UpdateAddress' }, { userId, UpdateAddress })
      .pipe(
        catchError((err) => {
          console.error('Email verification error:', err);
          return throwError(
            () =>
              new ConflictException(err.message || 'Invalid or expired OTP'),
          );
        }),
      );
  }
}
