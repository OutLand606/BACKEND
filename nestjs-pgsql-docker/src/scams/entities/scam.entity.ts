// src/scams/scam.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('scams_table')
export class Scam {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'boolean', default: false })
  is_scam: boolean;
}
