import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'Nguyen Van A',
  })
  @IsOptional()
  @IsString()
  @Length(3, 120)
  fullName?: string;

  @ApiPropertyOptional({
    example: '0901234567',
  })
  @IsOptional()
  @IsString()
  @Length(0, 30)
  phone?: string;

  @ApiPropertyOptional({
    example: '123 Nguyen Hue, Ben Nghe Ward, District 1, Ho Chi Minh City',
  })
  @IsOptional()
  @IsString()
  @Length(5, 500)
  fullAddress?: string;

  @ApiPropertyOptional({
    example: 10.776889,
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @ApiPropertyOptional({
    example: 106.700806,
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;
}
