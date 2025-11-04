import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course } from './entities/course.entity';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async findAll(): Promise<Course[]> {
    return this.coursesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Course | null> {
    return this.coursesService.findOne(+id);
  }

  @Post()
  async create(@Body() createCourseDto: Partial<Course>): Promise<Course> {
    return this.coursesService.create(createCourseDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCourseDto: Partial<Course>): Promise<Course> {
    return this.coursesService.update(+id, updateCourseDto);
  }

  @Post('seed')
  async seedData(): Promise<{ message: string; course: Course }> {
    return this.coursesService.seedData();
  }

  @Get('enroll/:code')
  async findByEnrollmentCode(@Param('code') code: string): Promise<Course | null> {
    return this.coursesService.findByEnrollmentCode(code);
  }
}

