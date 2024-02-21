import { ValidationArguments } from 'class-validator';

export const emailValidationMessage = (args: ValidationArguments) => {
  return `${args.property}에 email 형식에 맞는 값을 넣어주세요!`;
};
