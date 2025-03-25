// src/quotes/entities/quote.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { IsNotEmpty, IsString, Length } from 'class-validator';

@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  @IsNotEmpty()
  @IsString()
  @Length(10, 500)
  text: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  author: string;

  @Column({ nullable: true })
  category?: string;

  @Column({ unique: true })
  @Index()
  uniqueIdentifier: string;

  @CreateDateColumn()
  createdAt: Date;
}