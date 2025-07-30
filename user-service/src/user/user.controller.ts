import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }
    @MessagePattern({ cmd: 'FindUserById' })
    async login(@Payload() id: string) {
        return this.userService.findById(id);
    }
}
