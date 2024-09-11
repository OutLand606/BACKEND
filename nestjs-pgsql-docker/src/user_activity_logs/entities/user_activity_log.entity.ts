import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('user_activity_logs')
export class UserActivityLogEntity {
  @PrimaryGeneratedColumn({ name: 'log_id' })
  id: number;

  @Column({ name: 'user_name', nullable: true })
  userName: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ name: 'activity_date', nullable: true })
  activityDate: string;

  @Column({ name: 'is_successful', nullable: true })
  isSuccessful: string;

  @Column({ name: 'duration_seconds', nullable: true })
  durationSeconds: string;

  @Column({ name: 'activity_code', nullable: true })
  activityCode: string;

  @Column({ name: 'user_email', nullable: true })
  userEmail: string;

  @Column({ name: 'activity_time', nullable: true })
  activityTime: string;

  @Column({ name: 'session_uuid', nullable: true })
  sessionUuid: string;
}
