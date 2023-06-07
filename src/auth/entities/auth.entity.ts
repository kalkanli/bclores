import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'reports' })
export class User {
    
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({unique: true})
    username: string;

    @Column()
    email: string;
    
    @Column()
    passwordHashed: string;

    @Column()
    salt: string;
}
