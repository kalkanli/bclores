import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) { }

	@Post('/signin')
	async signin(@Body() dto: any) {
		return await this.authService.signin(dto);
	}

	@Post('/new-user')
	async newUser(@Body() dto: any) {
		this.authService.createNewUser(dto);
	}
}
