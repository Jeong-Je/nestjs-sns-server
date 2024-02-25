import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { ImageModelType } from 'src/common/entity/image.entity';
import { DataSource } from 'typeorm';
import { PostsImageService } from './image/dto/images.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly dataSource: DataSource,
    private readonly postsImageService: PostsImageService,
  ) {}

  @Get()
  getPosts(@Query() query: PaginatePostDto) {
    return this.postsService.paginatePosts(query);
  }

  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  @Post('random')
  @UseGuards(AccessTokenGuard)
  async postPostsRandom(@User('id') userId: number) {
    await this.postsService.generatePosts(userId);

    return true;
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  async postPost(
    @User('id') userId: number, //AccessTokenGuard의 사용이 먼저 필요함
    @Body() body: CreatePostDto,
    @Body('isPublic', new DefaultValuePipe(true)) isPublic: boolean,
  ) {
    // 트렌젝션과 관련된 모든 쿼리를 담당할 쿼리 러너 생성
    const qr = this.dataSource.createQueryRunner();

    // 쿼리 러너에 연결
    await qr.connect();

    // 쿼리 러너에서 트렌젝션을 시작
    await qr.startTransaction();

    // 로직 실행
    try {
      const post = await this.postsService.createPost(userId, body, qr);


      for (let i = 0; i < body.images.length; i++) {
        await this.postsImageService.createPostImage(
          {
            post,
            order: i,
            path: body.images[i],
            type: ImageModelType.POST_IMAGE,
          },
          qr,
        );
      }
      await qr.commitTransaction();
      await qr.release();

      return this.postsService.getPostById(post.id);
    } catch (error) {
      // 에러 발생 시
      // 트렌젝션 종료하고 원래 상태로 롤백
      await qr.rollbackTransaction();
      await qr.release();

    }
  }

  @Patch(':id')
  patchPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePostDto,
  ) {
    return this.postsService.updatePost(id, body);
  }

  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }
}
