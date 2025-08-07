import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

export enum OtpPurpose {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  LOGIN_2FA = 'LOGIN_2FA',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

@Entity()
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  code: string;

  @Column({
    type: 'enum',
    enum: OtpPurpose,
  })
  purpose: 'EMAIL_VERIFICATION' | 'LOGIN_2FA' | 'PASSWORD_RESET';

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: false })
  used: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
