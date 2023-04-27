import { BadRequestException, Injectable, UsePipes } from '@nestjs/common';
import * as moment from 'moment'
import * as argon2 from 'argon2'
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from '../dto/register.dto';
import { Prisma } from '@prisma/client';
import { GlobalService } from 'src/utils/global/global.service';
import { TrimPipe } from 'src/utils/trim.pipe';

const EMAIL_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/

@Injectable()
export class RegisterService {

    constructor(
        private readonly prisma: PrismaService,
    ) {

    }

    @UsePipes(new TrimPipe())
    async register(request: RegisterDto) {
        this.checkRequest(request);
        await this.prisma.$transaction(async (tx) => {
            const exists = await tx.hb_users.findFirst({
                where: {
                    email: request.email,
                },
                select: {
                    hb_user_id: true,
                }
            });
            if (exists) {
                throw new BadRequestException({
                    message: "user-exists"
                })
            }
            const pwdHash = await argon2.hash(request.password);
            await tx.hb_users.create({
                data: {
                    email: request.email,
                    password: pwdHash,
                    is_active: true,
                    created_at: moment().toDate(),
                }
            })
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable
        })
    }

    private checkRequest(request: RegisterDto) {
        if (!request.email.match(GlobalService.EMAIL_REGEX)) {
            throw new BadRequestException("invalid-email");
        }
        if (request.password !== request.password2) {
            throw new BadRequestException("password-mismatch");
        }
    }

}
