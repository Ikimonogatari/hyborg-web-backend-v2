import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { RegisterService } from './register/register.service';
import { LoginService } from './login/login.service';
import { UtilsModule } from 'src/utils/utils.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ProfileService } from './profile/profile.service';

@Module({
  imports: [
    UtilsModule, 
    ConfigModule.forRoot({
      envFilePath: '.env'
    }), 
    PrismaModule,
    PassportModule.register({
      defaultStrategy: 'jwt'
    })
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, RegisterService, LoginService, {
    provide: "APP_GUARD",
    useClass: JwtAuthGuard,
  }, ProfileService],
  exports: []
})
export class AuthModule {}
