// src/modules/comment/comment.service.js

import { commentRepository } from "./comment.repository.js";
import { issueRepository } from "../issue/issue.repository.js";
import { AppError } from "../../shared/errors/AppError.js";
import { ErrorCodes } from "../../shared/errors/ErrorCodes.js";

class CommentService {
  async createComment(
    { content },
    issueId,
    projectId,
    workspaceId,
    authorId
  ) {
    // Verify issue exists before adding comment
    const issue = await issueRepository.findById(issueId);

    if (!issue) {
      throw new AppError(
        "Issue not found.",
        404,
        ErrorCodes.ISSUE_NOT_FOUND
      );
    }

    const comment = await commentRepository.create({
      content,
      issueId,
      projectId,
      workspaceId,
      author: authorId,
    });

    return commentRepository.findByIdWithAuthor(comment._id);
  }

  async getComments(issueId, { page, limit }) {
    return commentRepository.findByIssue(issueId, { page, limit });
  }

  async updateComment(commentId, { content }, userId) {
    const comment = await commentRepository.findById(commentId);

    if (!comment) {
      throw new AppError(
        "Comment not found.",
        404,
        ErrorCodes.COMMENT_NOT_FOUND
      );
    }

    /**
     * Ownership check — only the author can edit.
     * This is record-level ownership, not role-based.
     * Even a project ADMIN cannot edit someone else's comment.
     */
    if (comment.author.toString() !== userId.toString()) {
      throw new AppError(
        "You can only edit your own comments.",
        403,
        ErrorCodes.COMMENT_FORBIDDEN
      );
    }

    const updated = await commentRepository.updateById(commentId, {
      content,
      isEdited: true,
      editedAt: new Date(),
    });

    return commentRepository.findByIdWithAuthor(updated._id);
  }

  async deleteComment(commentId, userId, userRole) {
    const comment = await commentRepository.findById(commentId);

    if (!comment) {
      throw new AppError(
        "Comment not found.",
        404,
        ErrorCodes.COMMENT_NOT_FOUND
      );
    }

    /**
     * Deletion is allowed if:
     * 1. The user is the comment author  OR
     * 2. The user is a project ADMIN
     *
     * Why allow ADMIN to delete?
     * Moderation — admins need to remove inappropriate content
     * without being the author.
     */
    const isAuthor = comment.author.toString() === userId.toString();
    const isAdmin  = userRole === "ADMIN";

    if (!isAuthor && !isAdmin) {
      throw new AppError(
        "You do not have permission to delete this comment.",
        403,
        ErrorCodes.COMMENT_FORBIDDEN
      );
    }

    await commentRepository.deleteById(commentId);
  }
}

export const commentService = new CommentService();