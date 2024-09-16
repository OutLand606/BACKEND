import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('user_table')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid',{ name: 'user_id' })
  id: number;

  @Column({ name: 'user_name', nullable: true })
  userName: string;

  @Column({ name: 'email', nullable: true })
  email: string;

  @Column({ name: 'pass', nullable: true })
  passWord: string;

}
