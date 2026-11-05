const { z } = require("zod");
const mongoose = require("mongoose");
const { HOSTEL_KIND_VALUES, HOSTEL_LEAVE_STATUS } = require("../config/constants");

const objectId = z.string().refine((v) => mongoose.Types.ObjectId.isValid(v), {
  message: "That is not a valid id",
});
const idParam = z.object({ id: objectId }).strict();
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
  .transform((v) => new Date(`${v}T00:00:00.000Z`));

const createHostelSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    code: z.string().trim().toUpperCase().min(2).max(16),
    kind: z.enum(HOSTEL_KIND_VALUES).optional(),
    address: z.string().trim().max(200).optional(),
  })
  .strict();

const createRoomSchema = z
  .object({
    number: z.string().trim().toUpperCase().min(1).max(16),
    capacity: z.coerce.number().int().min(1).max(20),
  })
  .strict();

const allocateSchema = z
  .object({
    student: objectId,
    room: objectId,
    academicYear: z.string().trim().min(4).max(16),
  })
  .strict();

const leaveSchema = z
  .object({
    fromDate: isoDate,
    toDate: isoDate,
    reason: z.string().trim().min(5, "Give a reason of at least 5 characters").max(300),
  })
  .strict()
  .refine((v) => v.toDate >= v.fromDate, {
    message: "Leave cannot end before it begins",
    path: ["toDate"],
  });

const decideLeaveSchema = z
  .object({
    decision: z.enum([HOSTEL_LEAVE_STATUS.APPROVED, HOSTEL_LEAVE_STATUS.REJECTED]),
    note: z.string().trim().max(300).optional(),
  })
  .strict();

const leaveQuerySchema = z
  .object({ status: z.string().trim().max(20).optional() })
  .strict();
const allocationQuerySchema = z
  .object({ status: z.string().trim().max(20).optional() })
  .strict();

/**
 * Student lookup for the allocation picker.
 *
 * The bound is deliberately small: this exists to disambiguate a name or roll
 * number, not to export the student directory. Two characters is the same
 * threshold the shared directory service applies.
 */
const searchStudentsQuerySchema = z
  .object({
    q: z.string().trim().min(2, "Type at least 2 characters").max(80),
  })
  .strict();

module.exports = {
  idParam,
  createHostelSchema,
  createRoomSchema,
  allocateSchema,
  leaveSchema,
  decideLeaveSchema,
  leaveQuerySchema,
  allocationQuerySchema,
  searchStudentsQuerySchema,
};
