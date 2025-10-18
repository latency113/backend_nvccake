import { ClassroomRepository } from "@/features/repository/Classroom/Classroom.repository";
import { CreateClassroomDto, UpdateClassroomDto } from "./Classroom.schema";
import { getPaginationParams } from "@/shared/utils/pagination";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import * as XLSX from "xlsx";
import { StudentService } from "../student/student.service";

export namespace ClassroomService {
  export async function uploadStudentsFromExcel(
    classroomId: string,
    file: File
  ) {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const students = [];

    for (let i = 10; i < data.length; i++) {
      // เริ่มจากแถว 11 (index 10)
      const row = data[i] as any[];
      const studentId = (row[2] || "").toString().trim();
      const studentName = (row[3] || "").toString().trim();

      if (studentId && studentName) {
        students.push({ studentId: studentId, studentName: studentName });
      }
    }

    // Fetch the existing classroom
    const existingClassroom = await ClassroomRepository.findById(classroomId);
    if (!existingClassroom) {
      throw new Error(`Classroom with ID ${classroomId} not found.`);
    }

    // Update the students field. Prisma's Json type expects a plain object or array.
    // Ensure the students array is stored correctly.
    const updatedClassroom = await ClassroomRepository.update(
      classroomId,
      { students: students as any } // Cast to any because Prisma's Json type can be tricky with direct array assignment
    );

    return updatedClassroom;
  }

  export async function getStudentsWithCakePounds(classroomId: string) {
    const classroom = await ClassroomRepository.findById(classroomId);

    if (!classroom) {
      throw new Error(`Classroom with ID ${classroomId} not found.`);
    }

    console.log("Classroom students data:", classroom.students);

    // Validate and filter students data
    let students: { studentId: string; studentName: string }[] = [];
    if (Array.isArray(classroom.students)) {
      students = (classroom.students as any[]).filter(
        (s): s is { studentId: string; studentName: string } =>
          s && typeof s.studentId === 'string' && s.studentId.trim() !== '' &&
          typeof s.studentName === 'string'
      );
    }

    const studentService = new StudentService();
    const result = await studentService.getTotalPoundsPerStudentByClassroom(classroomId, students);
    return result;
  }

  export async function create(Classroom: CreateClassroomDto) {
    if (!Classroom.name || Classroom.name.trim() === "") {
      throw new Error("Classroom name is required and cannot be empty.");
    }
    try {
      const newClassroom = ClassroomRepository.create(Classroom);
      return newClassroom;
    } catch (error: any) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error("Classroom name already exists");
      }
      throw error;
    }
  }

  export async function findAll(
    options: { page?: number; itemsPerPage?: number; search?: string, department_id?: string } = {}
  ) {
    const page = options.page ?? 1;
    const itemsPerPage = options.itemsPerPage ?? 10;
    const search = options.search;
    const department_id = options.department_id;

    const { skip, take } = getPaginationParams(page, itemsPerPage);
    const Classrooms = await ClassroomRepository.findAll({
      skip,
      take,
      search,
      department_id
    });

    // Sanitize students data
    const sanitizedClassrooms = Classrooms.map((classroom) => {
      if (classroom.students && Array.isArray(classroom.students)) {
        const students = (classroom.students as any[]).filter(s => s && typeof s.studentId === 'string' && s.studentId.trim() !== '');
        classroom.students = students;
      } else {
        classroom.students = []; // Ensure students is always an array
      }
      return classroom;
    });

    const total = await ClassroomRepository.countAll(search, department_id);

    const totalPages = ((total + itemsPerPage - 1) / itemsPerPage) >> 0;
    const nextPage = page < totalPages;
    const previousPage = page > 1;

    return {
      data: sanitizedClassrooms,
      meta_data: {
        page,
        itemsPerPage,
        total,
        totalPages,
        nextPage,
        previousPage,
      },
    };
  }

  export async function findById(ClassroomId: string) {
    return ClassroomRepository.findById(ClassroomId);
  }

  export async function update(
    ClassroomId: string,
    Classroom: UpdateClassroomDto
  ) {
    try {
      const data = { ...Classroom };
      return await ClassroomRepository.update(ClassroomId, data);
    } catch (error: any) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error("Classroom name already exists");
      }
      throw error;
    }
  }

  export async function deleteById(ClassroomId: string) {
    return ClassroomRepository.deleteById(ClassroomId);
  }
}
