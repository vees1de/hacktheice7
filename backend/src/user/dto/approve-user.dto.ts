import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class ApproveUserDto {
  @IsString()
  userId: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true }) // Явно указываем, что каждый элемент массива должен быть строкой
  categories: string[];
}
