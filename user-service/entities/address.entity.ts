import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Address {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column({ type: 'varchar', length: 255, nullable: true })
    line1: string;

    @Column({ type: 'varchar', length: 255, nullable: true }) 
    line2?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    city: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    state: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    postalCode: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    country: string;
}