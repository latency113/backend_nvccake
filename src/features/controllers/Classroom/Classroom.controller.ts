import Elysia, { t } from "elysia";
import { ClassroomSchema, ClassroomWithAllRelationsSchema } from "../../services/Classroom/Classroom.schema";
import { ClassroomService } from "../../services/Classroom/Classroom.service";

export namespace ClassroomController {
  export const classroomController = new Elysia({ prefix: "/classrooms" })
    .post(
      "/",
      async ({ body, set }) => {
        try {
          const newClassroom = await ClassroomService.create(body);
          set.status = 201;
          return {  newClassroom, message: "Classroom has created" };
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
        body: t.Omit(ClassroomSchema, ["id"]),
        response: {
          201: t.Object({
            newClassroom: ClassroomSchema,
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
      "/:ClassroomId",
      async ({ params }) => {
        const getClassroomById = await ClassroomService.findById(params.ClassroomId);
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
          const updateClassroom = await ClassroomService.update(params.ClassroomId, body);
          set.status = "OK";
          return {  updateClassroom, message: "Classroom has updated" };
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
        body: t.Partial(t.Omit(ClassroomSchema, ["id"])),
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
          const deleteClassroom = await ClassroomService.deleteById(params.ClassroomId);
          set.status = "OK";
          return {deleteClassroom, message: "Classroom has deleted"};
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
    )
}
