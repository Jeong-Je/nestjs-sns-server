import { BadRequestException, Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import { UsersModel } from 'src/users/entities/users.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([PostsModel, UsersModel]),
    CommonModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, AuthService, UsersService],
})
export class PostsModule {}
