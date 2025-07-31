import { Controller, UploadedFile, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { profile } from 'console';
import { AddressDto } from './dto/address.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }
    @MessagePattern({ cmd: 'FindUserById' })
    async login(@Payload() id: string) {
        return this.userService.findById(id);
    }

    @MessagePattern({ cmd: 'updateUser' })
    async updateUser(@Payload() data: { userid: string, updateUserDto: any,fileUrl: string }) {
        console.log("hello from contololler ")
        return this.userService.updateUser(data.userid, data.updateUserDto, data.fileUrl);
        
    }

    @MessagePattern({ cmd: 'UpdateAddress' })
    async addOrUpdateAddress(@Payload() data: { userId: string, UpdateAddress: AddressDto }) {
        return this.userService.addOrUpdateAddress(data.userId, data.UpdateAddress);
    }
}
