import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EventAttributes, ProfileAttributes } from './dto/event-attributes.interface';

@Entity({ name: 'events' })
export class EventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventName: string;

  @Column({ type: 'jsonb', nullable: true })
  eventAttributes: EventAttributes;

  @Column({ type: 'jsonb', nullable: true })
  profileAttributes: ProfileAttributes;

  @CreateDateColumn()
  createdAt: Date;
} 