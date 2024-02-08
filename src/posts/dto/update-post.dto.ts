import { PartialType } from "@nestjs/mapped-types";
import { CreatePostDto } from "./create-post.dto";
import { IsOptional, IsString } from "class-validator";
import { stringValidationMessage } from "src/common/validation-message/string-validation.message";

export class UpdatePostDto extends PartialType(CreatePostDto) {
    @IsOptional()
    @IsString({
        message: stringValidationMessage,
      })
    title?: string;

    @IsOptional()
    @IsString({
        message: stringValidationMessage,
      })
    content?: string;

}