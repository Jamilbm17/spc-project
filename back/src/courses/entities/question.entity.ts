import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './post.entity';

@Entity('questions')
export class Question {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    postId: number;

    @ManyToOne(() => Post, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'postId' })
    post: Post;

    @Column('text')
    text: string;

    @Column({ default: 'OPEN_TEXT' })
    type: 'OPEN_TEXT' | 'MULTIPLE_CHOICE' | 'POLL';

    @Column({ type: 'simple-json', nullable: true })
    options: string[] | null;

    @Column({ nullable: true })
    correctOptionIndex: number | null;

    @Column({ type: 'float', nullable: true, default: null })
    points: number | null;

    @Column({ default: 0 })
    order: number;
}
