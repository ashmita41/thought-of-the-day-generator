import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

@Entity('quotes')
@Unique(['text', 'author'])
export class Quote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  text: string;

  @Column('text')
  author: string;

  @Column('text')
  source: string;

  @Column('timestamp', { nullable: true })
  lastUsedAt: Date | null;

  @Column('integer', { default: 0 })
  usageCount: number;

  @CreateDateColumn()
  createdAt: Date;
}