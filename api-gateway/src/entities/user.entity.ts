import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToMany } from 'typeorm';
import { Otp } from './otp.entity';
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @OneToMany(() => Otp, (otp) => otp.user)
  otp: Otp[];

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  profilePic: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ nullable: true })
  googleId?: string;

  @Column({ default: false })
  isVerified: boolean;



}