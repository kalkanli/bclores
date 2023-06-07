import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './entities/auth.entity';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) { }

	@Post('/signin')
	async signin(@Body() user: User) {
		this.authService.signin();
	}

	@Post('/new-user')
	async newUser(@Body() user: any) {
		this.authService.createNewUser();
	}
}
