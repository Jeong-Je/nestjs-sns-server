import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { RolesEnum } from "../const/roles.const";

@Entity()
export class UsersModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    // 1) 길이가 20을 넘지 않을 것
    length: 20,
    // 2) 유일무이한 값이 될 것
    unique: true,
  })
  nickname: string;

  @Column({
    // 1) 유일무이한 값이 될 것
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @Column({
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;
}
