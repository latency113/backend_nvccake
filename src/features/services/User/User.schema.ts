import { t } from "elysia"

export const userSchema = t.Object({
    id: t.String(),
    firstname: t.String(),
    lastname: t.String(),
    username: t.String(),
    email: t.String(),
    password: t.String(),
    role: t.UnionEnum(["USER", "ADMIN","OFFICER","SUPERADMIN"]),
    createdAt :t.Date(),
    updatedAt :t.Date(),
})

export type User = typeof userSchema.static

//   id        String  @id @default(auto()) @map("_id") @db.ObjectId
//   firstname String
//   lastname  String
//   username  String  @unique
//   password  String
//   email     String?
// //   role      Role    @default(USER)
//   createdAt   DateTime      @default(now())
//   updatedAt   DateTime      @updatedAt