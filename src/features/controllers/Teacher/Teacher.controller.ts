import Elysia, { t } from "elysia";
import { TeacherSchema, TeacherWithRelationsSchema } from "../../services/Teacher/Teacher.schema";
import { TeacherService } from "../../services/Teacher/Teacher.service";

export namespace TeacherController {
  export const teacherController = new Elysia({ prefix: "/teachers" })
    .post(
      "/",
      async ({ body, set }) => {
        try {
          const newTeacher = await TeacherService.create(body);
          set.status = 201;
          return {  newTeacher, message: "Teacher has created" };
        } catch (error: any) {
          if (error.message === "Teachername already exists") {
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
        body: t.Omit(TeacherSchema, ["id", "createdAt", "updatedAt"]),
        response: {
          201: t.Object({
            newTeacher: TeacherSchema,
            message: t.String(),
          }),
          409: t.String(),
          500: t.String(),
        },
        tags: ["Teachers"],
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

        const result = await TeacherService.findAll({
          page,
          itemsPerPage,
          search,
        });

        if (result.data.length === 0 && search !== undefined) {
          set.status = "Not Found";
          return {
            message: "No Teacher found matching your search query.",
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
            data: t.Array(TeacherWithRelationsSchema),
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
        tags: ["Teachers"],
      }
    )
    .get(
      "/:TeacherId",
      async ({ params }) => {
        const getTeacherById = await TeacherService.findById(params.TeacherId);
        return getTeacherById;
      },
      {
        params: t.Object({
          TeacherId: t.String(),
        }),
        response: {
          200: TeacherSchema,
          500: t.String(),
        },
        tags: ["Teachers"],
      }
    )
    .patch(
      "/:TeacherId",
      async ({ params, body, set }) => {
        try {
          const updateTeacher = await TeacherService.update(params.TeacherId, body);
          set.status = "OK";
          return {  updateTeacher, message: "Teacher has updated" };
        } catch (error: any) {
          if (error.message === "Teachername already exists") {
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
        body: t.Partial(t.Omit(TeacherSchema, ["id", "createdAt", "updatedAt"])),
        params: t.Object({
          TeacherId: t.String(),
        }),
        response: {
          200: TeacherSchema,
          409: t.String(),
          500: t.String(),
        },
        tags: ["Teachers"],
      }
    )
    .delete(
      "/:TeacherId",
      async ({ params, set }) => {
        try {
          const deleteTeacher = await TeacherService.deleteById(params.TeacherId);
          set.status = "OK";
          return {deleteTeacher, message: "Teacher has deleted"};
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
          TeacherId: t.String(),
        }),
        response: {
          200: TeacherSchema,
          500: t.String(),
        },
        tags: ["Teachers"],
      }
    )
}
