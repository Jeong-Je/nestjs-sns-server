import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from 'src/users/entities/users.entity';
import { HASH_ROUNDS, JWT_SECRET } from './const/auth.const';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
    ){}

    /**
     * Payload에 들어갈 정보
     * 1) email
     * 2) sub -> id
     * 3) type: 'access' | 'refresh'
     * 
     * email: string, id: number
     */
    signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean){
        const payload = {
            email: user.email,
            sub: user.id,
            type: isRefreshToken ? 'refresh' : 'access',
        };

        return this.jwtService.sign(payload, {
            secret: JWT_SECRET,
            // seconds
            expiresIn: isRefreshToken ? 3600 : 300, 
        });
    }

    loginUser(user: Pick<UsersModel, 'email' | 'id'>){
        return {
            accessToken: this.signToken(user, false),
            refreshToken: this.signToken(user, true),
        }
    }

    async authenticateWithEmailAndPassword(user: Pick<UsersModel, 'email' | 'password'>) {
        /**
         * 1. 사용자가 존재하는 지 확인 (email)
         * 2. 비밀번호가 맞는 지 확인
         * 3. 모두 통과되면 찾은 사용자 정보 반환
         */
        const existinguser = await this.usersService.getUserByEmail(user.email);

        if (!existinguser) {
            throw new UnauthorizedException('존재하지 않는 사용자입니다.');
        }


        /**
         * 파라미터
         * 
         * 1) 입력된 비밀번호
         * 2) 기존 해시 (hash) -> 사용자 정보에 저장 되어 있는 hash
         */
        const passOk = await bcrypt.compare(user.password, existinguser.password);

        if(!passOk){
            throw new UnauthorizedException('비밀번호가 틀렸습니다.');    
        }

        return existinguser;
    }


    async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
        const existinguser = await this.authenticateWithEmailAndPassword(user);

        return this.loginUser(existinguser);
    }


    async registerWithEmail(user: Pick<UsersModel, 'nickname' | 'email' | 'password'>){
        const hash = await bcrypt.hash(
            user.password,
            HASH_ROUNDS,
        );

        const newUser = await this.usersService.createUser({
            ...user,
            password: hash,
        });

        return this.loginUser(newUser);
    }
}
