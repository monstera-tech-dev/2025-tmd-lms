import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { CoursesModule } from './courses/courses.module';
import { Course } from './courses/entities/course.entity';
import { CurriculumModule } from './curriculum/curriculum.module';
import { CurriculumModule as CurriculumModuleEntity } from './curriculum/entities/curriculum.entity';
import { Lesson } from './curriculum/entities/lesson.entity';

// .env 파일 로드 (모듈 로드 전에 실행 - TypeORM 설정 시 환경 변수 필요)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'monstera',
      database: process.env.DB_DATABASE || 'lms',
      entities: [Course, CurriculumModuleEntity, Lesson],
      synchronize: true, // 개발용: 자동 스키마 동기화
    }),
    CoursesModule,
    CurriculumModule,
  ],
})
export class AppModule {}

