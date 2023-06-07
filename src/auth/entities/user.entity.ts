import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'users' })
export class User {
    constructor(
        username: string,
        email: string,
        passwordHashed: string,
        salt: string
    ) {
        this.username = username;
        this.email = email;
        this.passwordHashed = passwordHashed;
        this.salt = salt;
    }
    
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({unique: true})
    username: string;

    @Column()
    email: string;
    
    @Column({name: 'password_hashed'})
    passwordHashed: string;

    @Column()
    salt: string;
}
