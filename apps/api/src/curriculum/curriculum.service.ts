import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurriculumModule } from './entities/curriculum.entity';
import { Lesson } from './entities/lesson.entity';
import { Course } from '../courses/entities/course.entity';

@Injectable()
export class CurriculumService {
  constructor(
    @InjectRepository(CurriculumModule)
    private curriculumRepository: Repository<CurriculumModule>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async findAllByCourse(courseId: number): Promise<CurriculumModule[]> {
    const modules = await this.curriculumRepository.find({
      where: { courseId },
      relations: ['course'],
      order: { order: 'ASC' },
    });

    // 각 모듈의 레슨도 함께 조회
    for (const module of modules) {
      const lessons = await this.lessonRepository.find({
        where: { curriculumModuleId: module.id },
        order: { order: 'ASC' },
      });
      (module as any).lessons = lessons;
    }

    return modules;
  }

  async seedData(courseId: number): Promise<{ message: string; modules: CurriculumModule[] }> {
    // Course가 없으면 먼저 생성
    let course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      course = this.courseRepository.create({
        title: '(1회차) 풀스택 과정',
        instructor: '김강사',
        thumbnail: '/photo/aaa.jpg',
        progress: 0,
        status: 'published',
      });
      course = await this.courseRepository.save(course);
      // 생성된 Course의 실제 ID를 사용
      courseId = course.id;
    }

    // 이미 데이터가 있는지 확인
    const existing = await this.curriculumRepository.findOne({
      where: { courseId, title: '오리엔테이션' }
    });

    if (existing) {
      const allModules = await this.findAllByCourse(courseId);
      return {
        message: '커리큘럼이 이미 존재합니다.',
        modules: allModules,
      };
    }

    // 강사 페이지에 있는 정확한 강좌 구성 데이터
    const modulesData = [
      {
        title: '오리엔테이션',
        order: 0,
        lessons: [
          { title: '강의 소개 및 환경 설정', description: '풀스택 과정 소개 및 학습 계획', order: 0 },
        ],
      },
      {
        title: '권혁진_풀스택',
        order: 1,
        lessons: [
          { title: '환경설정/기본문법/조건문/반복문', description: '환경설정 및 기본 문법 학습', order: 0 },
          { title: '(코드)함수/배열/객체', description: '함수, 배열, 객체 개념 및 실습', order: 1 },
          { title: '함수/배열/객체/DOM', description: 'DOM 조작과 실습', order: 2 },
          { title: '(코드)DOM', description: 'DOM 조작 코드 실습', order: 3 },
          { title: '이벤트 처리', description: '이벤트 처리 방법', order: 4 },
          { title: '웹 API', description: '웹 API 활용', order: 5 },
          { title: 'HTML/CSS', description: 'HTML과 CSS 기초', order: 6 },
        ],
      },
      {
        title: '정보통신개론 및 IT 기본 실습',
        order: 2,
        lessons: [
          { title: 'IT 산업 역사와 웹 개발 현황', description: 'IT 산업 개요', order: 0 },
          { title: '250926 영상강의', description: '영상 강의', order: 1 },
          { title: 'Github 대문꾸미기', description: 'Github 프로필 관리', order: 2 },
          { title: '알고리즘 연습방법', description: '알고리즘 학습 방법', order: 3 },
          { title: 'Github 와 백준허브 연동방법', description: 'Github와 백준 연동', order: 4 },
          { title: '온라인 타자연습', description: '타자 연습', order: 5 },
        ],
      },
      {
        title: '리엑트 NEW',
        order: 3,
        lessons: [
          { title: '타입스크립트', description: 'TypeScript 기초', order: 0 },
          { title: '타입스크립트 기초 연습문제', description: 'TypeScript 실습', order: 1 },
          { title: 'ES6', description: 'ES6 문법', order: 2 },
          { title: '리엑트 설명', description: 'React 소개', order: 3 },
          { title: '컴포넌트 기초', description: 'React 컴포넌트', order: 4 },
          { title: 'JSX 문법', description: 'JSX 사용법', order: 5 },
          { title: 'Props와 State', description: 'Props와 State 개념', order: 6 },
          { title: '이벤트 처리', description: 'React 이벤트', order: 7 },
          { title: '조건부 렌더링', description: '조건부 렌더링', order: 8 },
          { title: '리스트와 키', description: '리스트 렌더링', order: 9 },
          { title: '폼 처리', description: '폼 관리', order: 10 },
          { title: '라이프사이클', description: 'React 라이프사이클', order: 11 },
        ],
      },
    ];

    const createdModules: CurriculumModule[] = [];

    for (const moduleData of modulesData) {
      const module = this.curriculumRepository.create({
        courseId,
        title: moduleData.title,
        order: moduleData.order,
      });
      const savedModule = await this.curriculumRepository.save(module);

      for (const lessonData of moduleData.lessons) {
        const lesson = this.lessonRepository.create({
          curriculumModuleId: savedModule.id,
          title: lessonData.title,
          description: lessonData.description,
          order: lessonData.order,
        });
        await this.lessonRepository.save(lesson);
      }

      // 레슨 포함하여 다시 조회
      const moduleWithLessons = await this.curriculumRepository.findOne({
        where: { id: savedModule.id },
        relations: ['course'],
      });
      if (moduleWithLessons) {
        createdModules.push(moduleWithLessons);
      }
    }

    return {
      message: `커리큘럼 ${createdModules.length}개 모듈이 생성되었습니다.`,
      modules: createdModules.sort((a, b) => a.order - b.order),
    };
  }

  async create(courseId: number, createDto: { title: string; order?: number }): Promise<CurriculumModule> {
    const maxOrder = await this.curriculumRepository
      .createQueryBuilder('cm')
      .select('MAX(cm.order)', 'max')
      .where('cm.courseId = :courseId', { courseId })
      .getRawOne();

    const order = createDto.order ?? (maxOrder?.max ?? -1) + 1;

    const module = this.curriculumRepository.create({
      courseId,
      title: createDto.title,
      order,
    });

    return this.curriculumRepository.save(module);
  }

  async update(id: number, updateDto: { title?: string; order?: number }): Promise<CurriculumModule> {
    const module = await this.curriculumRepository.findOne({ where: { id } });
    if (!module) {
      throw new Error(`Curriculum module with ID ${id} not found`);
    }

    if (updateDto.title !== undefined) {
      module.title = updateDto.title;
    }
    if (updateDto.order !== undefined) {
      module.order = updateDto.order;
    }

    return this.curriculumRepository.save(module);
  }

  async remove(id: number): Promise<void> {
    await this.curriculumRepository.delete(id);
  }

  async createLesson(curriculumModuleId: number, createDto: { title: string; description?: string; order?: number }): Promise<Lesson> {
    const maxOrder = await this.lessonRepository
      .createQueryBuilder('lesson')
      .select('MAX(lesson.order)', 'max')
      .where('lesson.curriculumModuleId = :curriculumModuleId', { curriculumModuleId })
      .getRawOne();

    const order = createDto.order ?? (maxOrder?.max ?? -1) + 1;

    const lesson = this.lessonRepository.create({
      curriculumModuleId,
      title: createDto.title,
      description: createDto.description || null,
      order,
    });

    return this.lessonRepository.save(lesson);
  }

  async updateLesson(id: number, updateDto: { title?: string; description?: string }): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({ where: { id } });
    if (!lesson) {
      throw new Error(`Lesson with ID ${id} not found`);
    }

    if (updateDto.title !== undefined) {
      lesson.title = updateDto.title;
    }
    if (updateDto.description !== undefined) {
      lesson.description = updateDto.description;
    }

    return this.lessonRepository.save(lesson);
  }

  async removeLesson(id: number): Promise<void> {
    await this.lessonRepository.delete(id);
  }
}

