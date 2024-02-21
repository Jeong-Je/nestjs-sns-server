import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from './entities/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
  ) {}

  async createUser(user: Pick<UsersModel, 'email' | 'nickname' | 'password'>){
    // 1) nickname 중복이 없는 지 확인
    // exist() -> 만약에 조건에 해당하는 값이 있으면 true 반환

    const nicknameExists = await this.usersRepository.exist({
      where: {
        nickname: user.nickname,
      }
    });

    if (nicknameExists) {
      throw new BadRequestException('이미 존재하는 nickname 입니다!');
    }

    const emailExists = await this.usersRepository.exist({
      where: {
        email: user.email,
      }
    })

    if (emailExists) {
      throw new BadRequestException('이미 가입된 email 입니다!');
    }

    const userObject = this.usersRepository.create({
        nickname: user.nickname,
        email: user.email,
        password: user.password,
    });

    const newuser = await this.usersRepository.save(user);

    return newuser;
  }

  async getAllUsers(){
    return this.usersRepository.find({
      relations: ['posts']
    });
  }

  async getUserByEmail(email: string) {
    return this.usersRepository.findOne({
      where: {
        email,
      },
    });
  }
}
