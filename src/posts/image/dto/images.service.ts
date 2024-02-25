import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { basename, join } from 'path';
import { POST_IMAGE_PATH, TEMP_FOLDER_PATH } from 'src/common/const/path.const';
import { ImageModel } from 'src/common/entity/image.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreatePostImageDto } from './create-image.dto';
import { promises } from 'fs';

@Injectable()
export class PostsImageService {
  constructor(
    @InjectRepository(ImageModel)
    private readonly imageRepository: Repository<ImageModel>,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<ImageModel>(ImageModel)
      : this.imageRepository;
  }

  async createPostImage(dto: CreatePostImageDto, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    // dto의 이미지 이름을 기반으로
    // 파일의 경로를 생성한다.
    const tempFilePath = join(TEMP_FOLDER_PATH, dto.path);

    try {
      //파일이 존재하는 지 확인
      await promises.access(tempFilePath);
    } catch (error) {
      //파일이 존재하지 않으면 에러 출력
      throw new BadRequestException('존재하지 않는 파일 입니다.');
    }

    // 파일의 이름만 가져오기
    const fileName = basename(tempFilePath);

    // 새로 이동할 포스트 폴더의 경로 + 이미지 이름
    const newPath = join(POST_IMAGE_PATH, fileName);

    const result = await repository.save({
      ...dto,
    });

    await promises.rename(tempFilePath, newPath);

    return result;
  }
}
