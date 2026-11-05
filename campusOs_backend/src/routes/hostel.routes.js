const express = require("express");
const {
  authenticate,
  requirePermission,
  requireAnyPermission,
} = require("../middleware/auth");
const { csrfProtection } = require("../middleware/csrf");
const { validate } = require("../middleware/validate");
const { P } = require("../utils/permissions");
const controller = require("../controllers/hostel.controller");
const {
  idParam,
  createHostelSchema,
  createRoomSchema,
  allocateSchema,
  leaveSchema,
  decideLeaveSchema,
  leaveQuerySchema,
  allocationQuerySchema,
  searchStudentsQuerySchema,
} = require("../validators/hostel.validator");

const router = express.Router();

/**
 * GET /hostel/students?q=
 *
 * Declared before the parameterised routes so `students` is never captured as
 * an id. Gated on the managing permission: this is a tool for the allocation
 * form, not a directory every signed-in user may query.
 */
router.get(
  "/hostel/students",
  authenticate,
  requirePermission(P.HOSTEL_MANAGE),
  validate({ query: searchStudentsQuerySchema }),
  controller.searchStudents
);

router.get(
  "/hostel/hostels",
  authenticate,
  requirePermission(P.HOSTEL_READ_INSTITUTION),
  controller.listHostels
);
router.post(
  "/hostel/hostels",
  authenticate,
  csrfProtection,
  requirePermission(P.HOSTEL_MANAGE),
  validate({ body: createHostelSchema }),
  controller.createHostel
);

router.get(
  "/hostel/hostels/:id/rooms",
  authenticate,
  requirePermission(P.HOSTEL_READ_INSTITUTION),
  validate({ params: idParam }),
  controller.listRooms
);
router.post(
  "/hostel/hostels/:id/rooms",
  authenticate,
  csrfProtection,
  requirePermission(P.HOSTEL_MANAGE),
  validate({ params: idParam, body: createRoomSchema }),
  controller.createRoom
);

router.get(
  "/hostel/allocations",
  authenticate,
  requirePermission(P.HOSTEL_READ_INSTITUTION),
  validate({ query: allocationQuerySchema }),
  controller.listAllocations
);
router.post(
  "/hostel/allocations",
  authenticate,
  csrfProtection,
  requirePermission(P.HOSTEL_MANAGE),
  validate({ body: allocateSchema }),
  controller.allocate
);
router.post(
  "/hostel/allocations/:id/vacate",
  authenticate,
  csrfProtection,
  requirePermission(P.HOSTEL_MANAGE),
  validate({ params: idParam }),
  controller.vacate
);

router.get(
  "/hostel/me",
  authenticate,
  requirePermission(P.HOSTEL_READ_OWN),
  controller.mine
);
router.post(
  "/hostel/leaves",
  authenticate,
  csrfProtection,
  requirePermission(P.HOSTEL_LEAVE_OWN),
  validate({ body: leaveSchema }),
  controller.requestLeave
);
router.get(
  "/hostel/leaves",
  authenticate,
  requireAnyPermission(P.HOSTEL_APPROVE, P.HOSTEL_READ_INSTITUTION),
  validate({ query: leaveQuerySchema }),
  controller.listLeaves
);
router.post(
  "/hostel/leaves/:id/decide",
  authenticate,
  csrfProtection,
  requirePermission(P.HOSTEL_APPROVE),
  validate({ params: idParam, body: decideLeaveSchema }),
  controller.decideLeave
);

module.exports = router;
