import { t } from "elysia";

export const UserSchema = t.Object({
  id: t.String(),
  firstname: t.String(),
  lastname: t.String(),
  username: t.String(),
  password: t.String(),
  email: t.Optional(t.String()),
  role: t.UnionEnum(["SUPERADMIN","ADMIN","OFFICER","USER"]),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export type User = typeof UserSchema.static;

export const CreateUserDto = t.Object({
  firstname: t.String(),
  lastname: t.String(),
  username: t.String(),
  password: t.String(),
  email: t.Optional(t.String()),
  role: t.Optional(t.UnionEnum(["SUPERADMIN","ADMIN","OFFICER","USER"])),
});
export type CreateUserDto = typeof CreateUserDto.static;

export const UpdateUserDto = t.Partial(CreateUserDto);
export type UpdateUserDto = typeof UpdateUserDto.static;

//   id        String  @id @default(auto()) @map("_id") @db.ObjectId
//   firstname String
//   lastname  String
//   username  String  @unique
//   password  String
//   email     String?
// //   role      Role    @default(USER)
//   createdAt   DateTime      @default(now())
//   updatedAt   DateTime      @updatedAt