import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
	constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

	public async signin(dto: any) {
		try {
			const user = await this.userRepository.findOneOrFail({where: {email: dto.username}});
			const hash = await bcrypt.hash(dto.password, user.salt);
      		if (hash == user.passwordHashed) {
				return user;
			} else {
				throw new UnauthorizedException();
			}
		} catch (error) {
			throw error;
		}
	}

	public async createNewUser(dto: any) {
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(dto.password, salt)
  
		let user = new User(dto.username, dto.email, hashedPassword, salt);
		await this.userRepository.insert(user);
		return 200;
	}
}
