import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async findAll(): Promise<Course[]> {
    const courses = await this.courseRepository.find({
      order: { createdAt: 'DESC' },
    });

    // 수강코드가 없는 강좌에 자동으로 부여
    for (const course of courses) {
      if (!course.enrollmentCode) {
        course.enrollmentCode = await this.generateUniqueEnrollmentCode();
        await this.courseRepository.save(course);
      }
    }

    return courses;
  }

  async findOne(id: number): Promise<Course | null> {
    const course = await this.courseRepository.findOne({ where: { id } });

    // 수강코드가 없으면 자동으로 부여
    if (course && !course.enrollmentCode) {
      course.enrollmentCode = await this.generateUniqueEnrollmentCode();
      await this.courseRepository.save(course);
    }

    return course;
  }

  /**
   * 수강코드 생성 (예: ABC123)
   */
  private generateEnrollmentCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    let code = '';

    // 3자리 알파벳
    for (let i = 0; i < 3; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // 3자리 숫자
    for (let i = 0; i < 3; i++) {
      code += nums.charAt(Math.floor(Math.random() * nums.length));
    }

    return code;
  }

  /**
   * 고유한 수강코드 생성 (중복 체크)
   */
  private async generateUniqueEnrollmentCode(): Promise<string> {
    let code: string;
    let exists: boolean;

    do {
      code = this.generateEnrollmentCode();
      const existing = await this.courseRepository.findOne({
        where: { enrollmentCode: code }
      });
      exists = !!existing;
    } while (exists);

    return code;
  }

  async create(createCourseDto: Partial<Course>): Promise<Course> {
    // 수강코드가 없으면 자동 생성
    if (!createCourseDto.enrollmentCode) {
      createCourseDto.enrollmentCode = await this.generateUniqueEnrollmentCode();
    }

    const course = this.courseRepository.create(createCourseDto);
    return this.courseRepository.save(course);
  }

  async update(id: number, updateCourseDto: Partial<Course>): Promise<Course> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) {
      throw new Error(`Course with ID ${id} not found`);
    }

    Object.assign(course, updateCourseDto);
    return this.courseRepository.save(course);
  }

  /**
   * 수강코드로 강좌 조회
   */
  async findByEnrollmentCode(code: string): Promise<Course | null> {
    return this.courseRepository.findOne({
      where: { enrollmentCode: code }
    });
  }

  async seedData(): Promise<{ message: string; course: Course }> {
    // 이미 데이터가 있는지 확인
    const existing = await this.courseRepository.findOne({
      where: { title: '(1회차) 풀스택 과정' }
    });

    if (existing) {
      return {
        message: '강좌가 이미 존재합니다.',
        course: existing,
      };
    }

    // 강사 페이지에 보이는 강좌 데이터 생성
    const enrollmentCode = await this.generateUniqueEnrollmentCode();
    const course = this.courseRepository.create({
      title: '(1회차) 풀스택 과정',
      instructor: '김강사',
      thumbnail: '/photo/aaa.jpg',
      progress: 0,
      status: 'published',
      enrollmentCode: enrollmentCode,
    });

    const saved = await this.courseRepository.save(course);

    return {
      message: '강좌 데이터가 성공적으로 생성되었습니다.',
      course: saved,
    };
  }
}

