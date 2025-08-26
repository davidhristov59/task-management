import { useState } from 'react';
import { MessageCircle, Edit2, Trash2, Send, User } from 'lucide-react';
import { useComments, useCreateComment, useUpdateComment, useDeleteComment } from '../../hooks/useComments';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import type { Comment } from '../../types';

interface CommentSectionProps {
  workspaceId: string;
  projectId: string;
  taskId: string;
}

interface CommentItemProps {
  comment: Comment;
  workspaceId: string;
  projectId: string;
  taskId: string;
  onEdit: (comment: Comment) => void;
}

function CommentItem({ comment, workspaceId, projectId, taskId, onEdit }: CommentItemProps) {
  const deleteCommentMutation = useDeleteComment();

  const handleDelete = () => {
    deleteCommentMutation.mutate({ workspaceId, projectId, taskId, commentId: comment.commentId });
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <p className="text-sm font-medium">{comment.authorId}</p>
            <p className="text-xs text-gray-500">{formatTimestamp(comment.timestamp)}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(comment)}
            className="h-8 w-8 p-0"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this comment? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={deleteCommentMutation.isPending}
                >
                  {deleteCommentMutation.isPending ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
    </div>
  );
}

export function CommentSection({ workspaceId, projectId, taskId }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editContent, setEditContent] = useState('');

  const { data: comments = [], isLoading, error } = useComments(workspaceId, projectId, taskId);
  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();

  const handleSubmitNewComment = async () => {
    if (!newComment.trim()) return;

    try {
      await createCommentMutation.mutateAsync({
        workspaceId,
        projectId,
        taskId,
        data: {
          authorId: 'current-user', // TODO: Replace with actual current user ID
          content: newComment.trim()
        }
      });
      setNewComment('');
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingComment(comment);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const handleSubmitEdit = async () => {
    if (!editingComment || !editContent.trim()) return;

    try {
      await updateCommentMutation.mutateAsync({
        workspaceId,
        projectId,
        taskId,
        commentId: editingComment.commentId,
        data: {
          content: editContent.trim()
        }
      });
      setEditingComment(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      action();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New Comment Form */}
        <div className="space-y-3">
          <Textarea
            placeholder="Add a comment... (Ctrl+Enter to submit)"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, handleSubmitNewComment)}
            className="min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitNewComment}
              disabled={!newComment.trim() || createCommentMutation.isPending}
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              {createCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </div>

        {/* Comments List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Failed to load comments. Please try again.</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.commentId}>
                {editingComment?.commentId === comment.commentId ? (
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{comment.authorId}</p>
                        <p className="text-xs text-gray-500">Editing comment</p>
                      </div>
                    </div>
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyDown={(e) => handleKeyPress(e, handleSubmitEdit)}
                      className="min-h-[80px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSubmitEdit}
                        disabled={!editContent.trim() || updateCommentMutation.isPending}
                      >
                        {updateCommentMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <CommentItem
                    comment={comment}
                    workspaceId={workspaceId}
                    projectId={projectId}
                    taskId={taskId}
                    onEdit={handleStartEdit}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}