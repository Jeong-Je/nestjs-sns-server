import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import { UsersModel } from 'src/users/entities/users.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([PostsModel, UsersModel]),
  ],
  controllers: [PostsController],
  providers: [PostsService, AuthService, UsersService],
})
export class PostsModule {}
