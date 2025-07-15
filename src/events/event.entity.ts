import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'events' })
export class EventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventName: string;

  @Column({ type: 'jsonb', nullable: true })
  eventAttributes: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  profileAttributes: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
} 