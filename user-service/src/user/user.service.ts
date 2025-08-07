import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { vercelBlob } from '../vercelBlob/vercelBlob.service';
import { Address } from '../../entities/address.entity';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { profile } from 'console';
import { AddressDto } from './dto/address.dto';
import { del } from '@vercel/blob';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    private readonly vercelBlob: vercelBlob,
  ) { }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByGoogleId(googleId: string) {
    return this.userRepository.findOne({ where: { googleId } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id }, relations: ['address'] });
  }

  async create(email: string, password: string, name?: string): Promise<User> {
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new RpcException('Email already exists');
    }

    const googleId = password
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      googleId
    });
    return this.userRepository.save(user);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto, fileUrl: string): Promise<User> {

    const user = await this.findById(id);
    if (!user) {
      throw new RpcException('User not found');
    }

    if (updateUserDto.name) {
      user.name = updateUserDto.name;
    }

    if (fileUrl) {
      
      if (user.profilePicture && !user.profilePicture.includes("googleusercontent.com")) {

        await del(user.profilePicture)

      }
      user.profilePicture = fileUrl;
    }


    return this.userRepository.save(user);
  }

  async addOrUpdateAddress(id: string, addressDto: AddressDto) {
    const user = await this.findById(id);
    if (!user) {
      throw new RpcException('User not found');
    }

    if (user.address) {
      // Update existing address
      const address = await this.addressRepository.findOne({ where: { id: user.address.id } });
      if (!address) throw new RpcException('User not found');
      Object.assign(address, addressDto);
      await this.addressRepository.save(address);
    } else {
      // Create new address
      const address = this.addressRepository.create(addressDto);
      user.address = await this.addressRepository.save(address);
      await this.userRepository.save(user);
    }

    return this.findById(id);
  }

  async save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async update(id: string, updateUserDto: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new RpcException('User not found');
    }
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }
}
