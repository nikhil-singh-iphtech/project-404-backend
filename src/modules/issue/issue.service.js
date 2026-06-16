

import { issueRepository } from "./issue.repository.js";
import { projectRepository } from "../project/project.repository.js";
import { AppError } from "../../shared/errors/AppError.js";
import { ErrorCodes } from "../../shared/errors/ErrorCodes.js";
import {
  ISSUE_TYPES,
  ISSUE_STATUSES,
  VALID_PARENT_TYPES,
  VALID_STATUS_TRANSITIONS,
  REQUIRES_PARENT
} from "../../shared/constants/issue.constants.js";
import { activityService } from "../activity/activity.service.js";
import { ACTIVITY_TYPES } from "../../shared/constants/activity.constants.js";

class IssueService {
  /**
   * Validates that the parent issue exists and the
   * parent-child type relationship is allowed.
   */
  async #validateParent(parentId, childType) {
    const parent = await issueRepository.findById(parentId);

    if (!parent) {
      throw new AppError(
        "Parent issue not found.",
        404,
        ErrorCodes.ISSUE_NOT_FOUND
      );
    }

    const allowedParentTypes = VALID_PARENT_TYPES[childType];

    if (!allowedParentTypes) {
      throw new AppError(
        `${childType} cannot have a parent issue.`,
        400,
        ErrorCodes.ISSUE_INVALID_PARENT
      );
    }

    if (!allowedParentTypes.includes(parent.type)) {
      throw new AppError(
        `A ${childType} cannot be a child of ${parent.type}. ` +
        `Allowed parent types: ${allowedParentTypes.join(", ")}.`,
        400,
        ErrorCodes.ISSUE_INVALID_PARENT
      );
    }

    return parent;
  }

 

async createIssue(
  { title, description, type, priority, assignees, parentId,
    sprintId, labels, dueDate, estimatedHours },
  projectId,
  workspaceId,
  reporterId
) {
  const project = await projectRepository.findById(projectId);
  if (!project) {
    throw new AppError("Project not found.", 404, ErrorCodes.PROJECT_NOT_FOUND);
  }

  // ─── Parent Validation ──────────────────────────────────────

  /**
   * EPIC cannot have a parent — ever.
   */
  if (type === ISSUE_TYPES.EPIC && parentId) {
    throw new AppError(
      "Epics cannot have a parent issue.",
      400,
      ErrorCodes.ISSUE_INVALID_PARENT
    );
  }

  /**
   * Types that REQUIRE a parent: STORY and SUBTASK.
   * VALID_PARENT_TYPES defines which types need a parent.
   * If a type exists as a key in VALID_PARENT_TYPES,
   * it must have a parentId.
   */
  const requiresParent = REQUIRES_PARENT.includes(type);


  if (requiresParent && !parentId) {
    const allowedParents = VALID_PARENT_TYPES[type].join(", ");
    throw new AppError(
      `${type} requires a parent issue. Allowed parent types: ${allowedParents}.`,
      400,
      ErrorCodes.ISSUE_INVALID_PARENT
    );
  }

  /**
   * If parentId is provided, validate the relationship is allowed.
   */
  if (parentId) {
    await this.#validateParent(parentId, type);
  }

  // rest of the method stays the same...
  const issueNumber = await issueRepository.getNextIssueNumber(projectId);
  const issueCode   = `${project.key}-${issueNumber}`;

  const maxOrder = await issueRepository.getMaxOrder(
    projectId,
    ISSUE_STATUSES.TODO
  );

  const issue = await issueRepository.create({
    title,
    description,
    type,
    priority,
    status:         ISSUE_STATUSES.TODO,
    assignees:      assignees      || [],
    reporter:       reporterId,
    parentId:       parentId       || null,
    sprintId:       sprintId       || null,
    labels:         labels         || [],
    dueDate:        dueDate        || null,
    estimatedHours: estimatedHours || null,
    projectId,
    workspaceId,
    issueNumber,
    issueCode,
    order: maxOrder + 1,
  });

  activityService.log({
  actor:       reporterId,
  type:        ACTIVITY_TYPES.ISSUE_CREATED,
  workspaceId,
  projectId,
  issueId:     issue._id,
  metadata: {
    issueCode: issue.issueCode,
    title:     issue.title,
    type:      issue.type,
  },
});

  return issueRepository.findById(issue._id);
}

  async getIssues(projectId, filters) {
    return issueRepository.findAllByProject(projectId, filters);
  }

  async getIssueById(issueId) {
    const issue = await issueRepository.findById(issueId);

    if (!issue) {
      throw new AppError("Issue not found.", 404, ErrorCodes.ISSUE_NOT_FOUND);
    }

    return issue;
  }

  async updateIssue(issueId, updates,userId) {
    /**
     * If parentId is being updated, validate the new parent.
     * If type is being updated alongside parentId, validate
     * the relationship with the new type.
     */
    if (updates.parentId) {
      const issue = await issueRepository.findById(issueId);
      if (!issue) {
        throw new AppError("Issue not found.", 404, ErrorCodes.ISSUE_NOT_FOUND);
      }
      const type = updates.type || issue.type;
      await this.#validateParent(updates.parentId, type);
    }

    const issue = await issueRepository.updateById(issueId, updates);

    if (!issue) {
      throw new AppError("Issue not found.", 404, ErrorCodes.ISSUE_NOT_FOUND);


    }

    activityService.log({
    actor:       userId,
    type:        ACTIVITY_TYPES.ISSUE_UPDATED,
    workspaceId: issue.workspaceId,
    projectId:   issue.projectId,
    issueId:     issue._id,
    metadata: {
      issueCode: issue.issueCode,
      fields:    Object.keys(updates),
    },
  });

    return issueRepository.findById(issueId);
  }

  async updateStatus(issueId, newStatus,userId) {
    const issue = await issueRepository.findById(issueId);

    if (!issue) {
      throw new AppError("Issue not found.", 404, ErrorCodes.ISSUE_NOT_FOUND);
    }

    /**
     * Validate status transition.
     * Only allowed transitions from VALID_STATUS_TRANSITIONS
     * are permitted.
     */
    const allowedTransitions = VALID_STATUS_TRANSITIONS[issue.status];

    if (!allowedTransitions.includes(newStatus)) {
      throw new AppError(
        `Cannot transition from ${issue.status} to ${newStatus}. ` +
        `Allowed transitions: ${allowedTransitions.join(", ")}.`,
        400,
        ErrorCodes.ISSUE_INVALID_TRANSITION
      );
    }

    /**
     * Place the issue at the bottom of the new status column.
     */
    const maxOrder = await issueRepository.getMaxOrder(
      issue.projectId,
      newStatus
    );

    activityService.log({
    actor:       userId,
    type:        ACTIVITY_TYPES.ISSUE_STATUS_CHANGED,
    workspaceId: issue.workspaceId,
    projectId:   issue.projectId,
    issueId:     issue._id,
    metadata: {
      issueCode: issue.issueCode,
      from:      issue.status,
      to:        newStatus,
    },
  });

    return issueRepository.updateById(issueId, {
      status: newStatus,
      order:  maxOrder + 1,
    });
  }

  async getSubtasks(issueId) {
    const issue = await issueRepository.findById(issueId);

    if (!issue) {
      throw new AppError("Issue not found.", 404, ErrorCodes.ISSUE_NOT_FOUND);
    }

    return issueRepository.findSubtasks(issueId);
  }

  async deleteIssue(issueId,userId) {
    const issue = await issueRepository.findById(issueId);

    if (!issue) {
      throw new AppError("Issue not found.", 404, ErrorCodes.ISSUE_NOT_FOUND);
    }

       activityService.log({
    actor:       userId,
    type:        ACTIVITY_TYPES.ISSUE_DELETED,
    workspaceId: issue.workspaceId,
    projectId:   issue.projectId,
    issueId:     issue._id,
    metadata: {
      issueCode: issue.issueCode,
      title:     issue.title,
    },
  });

    /**
     * Delete all subtasks when parent is deleted.
     * Orphaned subtasks cause data integrity issues.
     */
    await issueRepository.model.deleteMany({ parentId: issueId });
    await issueRepository.deleteById(issueId);

   


  }

   /**
   * Returns the full board state grouped by status columns.
   */
  async getBoardIssues(projectId, filters) {
    return issueRepository.getBoardIssues(projectId, filters);
  }

  /**
   * Moves an issue to a new position and/or column.
   *
   * @param {string} issueId    - The issue being moved
   * @param {string} newStatus  - Target column status
   * @param {number} newOrder   - Target position in column (1-based)
   * @param {string} projectId  - Project context
   */
  async moveIssue({ issueId, newStatus, newOrder, projectId }) {
    // ─── Step 1: Fetch the issue ────────────────────────────────
    const issue = await issueRepository.findById(issueId);

    if (!issue) {
      throw new AppError(
        "Issue not found.",
        404,
        ErrorCodes.ISSUE_NOT_FOUND
      );
    }

    if (!newOrder) {
    const maxOrder = await issueRepository.getMaxOrder(projectId, newStatus);
    newOrder = maxOrder + 1;
  }

    const oldStatus = issue.status;
    const oldOrder  = issue.order;
    const isSameColumn = oldStatus === newStatus;

    // ─── Step 2: Build bulk operations ─────────────────────────
    const bulkOperations = [];

    if (isSameColumn) {
      /**
       * SAME COLUMN MOVE
       *
       * Example: Moving BACK-3 from position 3 to position 1 in TODO
       *
       * Before:                After:
       * pos 1 → BACK-1         pos 1 → BACK-3  ← moved
       * pos 2 → BACK-2         pos 2 → BACK-1  ← shifted down
       * pos 3 → BACK-3         pos 3 → BACK-2  ← shifted down
       *
       * Logic:
       * Moving UP (newOrder < oldOrder):
       *   Issues between newOrder and oldOrder-1 shift DOWN (+1)
       *
       * Moving DOWN (newOrder > oldOrder):
       *   Issues between oldOrder+1 and newOrder shift UP (-1)
       */
      const columnIssues = await issueRepository.getColumnIssues(
        projectId,
        oldStatus
      );

      const movingUp = newOrder < oldOrder;

      columnIssues.forEach((columnIssue) => {
        // Skip the issue being moved — handled separately
        if (columnIssue._id.toString() === issueId.toString()) return;

        if (movingUp) {
          // Shift issues between newOrder and oldOrder down
          if (
            columnIssue.order >= newOrder &&
            columnIssue.order < oldOrder
          ) {
            bulkOperations.push({
              updateOne: {
                filter: { _id: columnIssue._id },
                update: { $set: { order: columnIssue.order + 1 } },
              },
            });
          }
        } else {
          // Shift issues between oldOrder and newOrder up
          if (
            columnIssue.order > oldOrder &&
            columnIssue.order <= newOrder
          ) {
            bulkOperations.push({
              updateOne: {
                filter: { _id: columnIssue._id },
                update: { $set: { order: columnIssue.order - 1 } },
              },
            });
          }
        }
      });

      // Update the moved issue itself
      bulkOperations.push({
        updateOne: {
          filter: { _id: issueId },
          update: { $set: { order: newOrder } },
        },
      });

    } else {
      /**
       * CROSS COLUMN MOVE
       *
       * Example: Moving BACK-3 from TODO pos 2 to IN_PROGRESS pos 1
       *
       * Source column (TODO) — close the gap:
       *   Issues BELOW old position shift UP (-1)
       *
       * Destination column (IN_PROGRESS) — make space:
       *   Issues AT and BELOW new position shift DOWN (+1)
       */

      // Source column — shift issues after oldOrder up
      const sourceColumnIssues = await issueRepository.getColumnIssues(
        projectId,
        oldStatus
      );

      sourceColumnIssues.forEach((columnIssue) => {
        if (columnIssue._id.toString() === issueId.toString()) return;

        if (columnIssue.order > oldOrder) {
          bulkOperations.push({
            updateOne: {
              filter: { _id: columnIssue._id },
              update: { $set: { order: columnIssue.order - 1 } },
            },
          });
        }
      });

      // Destination column — shift issues at newOrder and below down
      const destColumnIssues = await issueRepository.getColumnIssues(
        projectId,
        newStatus
      );

      destColumnIssues.forEach((columnIssue) => {
        if (columnIssue.order >= newOrder) {
          bulkOperations.push({
            updateOne: {
              filter: { _id: columnIssue._id },
              update: { $set: { order: columnIssue.order + 1 } },
            },
          });
        }
      });

      // Update the moved issue with new status and order
      bulkOperations.push({
        updateOne: {
          filter: { _id: issueId },
          update: { $set: { status: newStatus, order: newOrder } },
        },
      });
    }

    // ─── Step 3: Execute all updates in one round trip ──────────
    await issueRepository.bulkUpdateOrder(bulkOperations);

    // ─── Step 4: Return full updated board ──────────────────────
    return issueRepository.getBoardIssues(projectId);
  }
}

export const issueService = new IssueService();