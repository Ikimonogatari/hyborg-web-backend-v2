import { BadRequestException, Injectable, UnauthorizedException, UsePipes } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';

import { LoginDto } from '../dto/login.dto';
import { TrimPipe } from 'src/utils/trim.pipe';
import { GlobalService } from 'src/utils/global/global.service';

@Injectable()
export class LoginService {

    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
    ) {

    }

    @UsePipes(new TrimPipe())
    async login(request: LoginDto){
        this.checkRequest(request)
        const foundUser = await this.prisma.users.findFirst({
            where: {
                email: request.email,
            },
            select: {
                user_id: true,
                email: true,
                password: true,
            }
        })
        if (!foundUser) {
            throw new UnauthorizedException("user-not-found");
        }
        const pwdHash = foundUser.password
        const pwdMatch = await argon2.verify(pwdHash, request.password)
        if (!pwdMatch) {
            throw new UnauthorizedException("invalid-credentials")
        }
        const jwt = await this.jwtService.signAsync({
            email: request.email,
            id: foundUser.user_id.toString(),
            role: "user"
        })
        return {
            accessToken: jwt,
        }
    }

    private checkRequest(request: LoginDto) {
        if (!request.email.match(GlobalService.EMAIL_REGEX)) {
            throw new BadRequestException("invalid-email");
        }
    }
}
