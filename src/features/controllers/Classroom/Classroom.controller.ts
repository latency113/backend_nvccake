import Elysia, { t } from "elysia";
import {
  ClassroomSchema,
  ClassroomWithAllRelationsSchema,
  CreateClassroomDto,
  UpdateClassroomDto,
} from "../../services/Classroom/Classroom.schema";
import { ClassroomService } from "../../services/Classroom/Classroom.service";

export namespace ClassroomController {
  export const classroomController = new Elysia({ prefix: "/classrooms" })
    .post(
      "/:ClassroomId/upload-students",
      async ({ params, body, set }) => {
        try {
          const { ClassroomId } = params;
          const { file } = body;

          if (!file) {
            set.status = "Bad Request";
            return "No file uploaded.";
          }

          const updatedClassroom =
            await ClassroomService.uploadStudentsFromExcel(ClassroomId, file);

          set.status = "OK";
          return {
            updatedClassroom,
            message: "Students uploaded and classroom updated successfully.",
          };
        } catch (error: any) {
          set.status = "Internal Server Error";
          if ("message" in error) {
            return error.message;
          }
          return "Internal Server Error";
        }
      },
      {
        params: t.Object({
          ClassroomId: t.String(),
        }),
        body: t.Object({
          file: t.File(),
        }),
        type: "formdata",
        response: {
          200: t.Object({
            updatedClassroom: ClassroomSchema,
            message: t.String(),
          }),
          400: t.String(),
          500: t.String(),
        },
        tags: ["Classrooms"],
      }
    )
    .post(
      "/",
      async ({ body, set }) => {
        try {
          const { file, ...classroomData } = body; // Destructure file and classroomData

          // 1. Create the classroom
          const newClassroom = await ClassroomService.create(
            classroomData as CreateClassroomDto
          ); // Cast to CreateClassroomDto

          // 2. If a file was provided, upload students
          if (file) {
            await ClassroomService.uploadStudentsFromExcel(
              newClassroom.id,
              file
            );
          }

          set.status = 201;
          // Fetch the classroom again to include the updated students data in the response
          const classroomWithStudents = await ClassroomService.findById(
            newClassroom.id
          );
          return {
            newClassroom: classroomWithStudents,
            message: "Classroom has created and students uploaded",
          };
        } catch (error: any) {
          if (error.message === "Classroom name already exists") {
            set.status = "Conflict";
            return error.message;
          }
          set.status = "Internal Server Error";
          if ("message" in error) {
            return error.message;
          }
          return "Internal Server Error";
        }
      },
      {
        body: t.Object({
          name: t.String(),
          teacher_id: t.String(),
          department_id: t.String(),
          grade_level_id: t.String(),
          file: t.File(),
        }),
        type: "formdata", // Important for file uploads
        response: {
          201: t.Object({
            newClassroom: ClassroomWithAllRelationsSchema, // Updated to include students
            message: t.String(),
          }),
          409: t.String(),
          500: t.String(),
        },
        tags: ["Classrooms"],
      }
    )
    .get(
      "/",
      async ({ query, set }) => {
        const page = query.page ? Number(query.page) : 1;
        const itemsPerPage = query.itemsPerPage
          ? Number(query.itemsPerPage)
          : 10;
        const search = query.search;

        const result = await ClassroomService.findAll({
          page,
          itemsPerPage,
          search,
        });

        if (result.data.length === 0 && search !== undefined) {
          set.status = "Not Found";
          return {
            message: "No Classroom found matching your search query.",
          };
        }

        return result;
      },
      {
        query: t.Object({
          page: t.Optional(t.Numeric()),
          itemsPerPage: t.Optional(t.Numeric()),
          search: t.Optional(t.String()),
          department_id: t.Optional(t.String()),
        }),
        response: {
          200: t.Object({
            data: t.Array(ClassroomWithAllRelationsSchema),
            meta_data: t.Object({
              page: t.Number(),
              itemsPerPage: t.Number(),
              total: t.Number(),
              totalPages: t.Number(),
              nextPage: t.Boolean(),
              previousPage: t.Boolean(),
            }),
          }),
          404: t.Object({
            message: t.String(),
          }),
          500: t.String(),
        },
        tags: ["Classrooms"],
      }
    )
    .get(
      "/:ClassroomId/students-with-cake-pounds",
      async ({ params, set }) => {
        try {
          const { ClassroomId } = params;
          const result = await ClassroomService.getStudentsWithCakePounds(
            ClassroomId
          );
          set.status = "OK";
          return result;
        } catch (error: any) {
          set.status = "Internal Server Error";
          if ("message" in error) {
            return error.message;
          }
          return "Internal Server Error";
        }
      },
      {
        params: t.Object({
          ClassroomId: t.String(),
        }),
        response: {
          200: t.Object({
            students: t.Array(
              t.Object({
                number: t.String(),
                name: t.String(),
                totalPounds: t.Number(),
              })
            ),
            totalPoundsForClassroom: t.Number(),
          }),
          500: t.String(),
        },
        tags: ["Classrooms"],
      }
    )
    .get(
      "/:ClassroomId",
      async ({ params }) => {
        const getClassroomById = await ClassroomService.findById(
          params.ClassroomId
        );
        return getClassroomById;
      },
      {
        params: t.Object({
          ClassroomId: t.String(),
        }),
        response: {
          200: ClassroomSchema,
          500: t.String(),
        },
        tags: ["Classrooms"],
      }
    )
    .patch(
      "/:ClassroomId",
      async ({ params, body, set }) => {
        try {
          const updateClassroom = await ClassroomService.update(
            params.ClassroomId,
            body
          );
          set.status = "OK";
          return { updateClassroom, message: "Classroom has updated" };
        } catch (error: any) {
          if (error.message === "Classroomname already exists") {
            set.status = "Conflict";
            return error.message;
          }
          set.status = "Internal Server Error";
          if ("message" in error) {
            return error.message;
          }
          return "Internal Server Error";
        }
      },
      {
        body: UpdateClassroomDto,
        params: t.Object({
          ClassroomId: t.String(),
        }),
        response: {
          200: ClassroomSchema,
          409: t.String(),
          500: t.String(),
        },
        tags: ["Classrooms"],
      }
    )
    .delete(
      "/:ClassroomId",
      async ({ params, set }) => {
        try {
          const deleteClassroom = await ClassroomService.deleteById(
            params.ClassroomId
          );
          set.status = "OK";
          return { deleteClassroom, message: "Classroom has deleted" };
        } catch (error: any) {
          set.status = "Internal Server Error";
          if ("message" in error) {
            return error.message;
          }
          return "Internal Server Error";
        }
      },
      {
        params: t.Object({
          ClassroomId: t.String(),
        }),
        response: {
          200: ClassroomSchema,
          500: t.String(),
        },
        tags: ["Classrooms"],
      }
    );
}
