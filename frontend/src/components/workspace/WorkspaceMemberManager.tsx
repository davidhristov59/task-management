import { useState } from 'react';
import { X, Trash2, Users, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAddWorkspaceMember, useRemoveWorkspaceMember } from '@/hooks';
import type { Workspace } from '@/types';

interface WorkspaceMemberManagerProps {
  workspace: Workspace;
  onClose: () => void;
  onMemberChange?: () => void; // Optional callback when members change
}

export function WorkspaceMemberManager({ workspace, onClose, onMemberChange }: WorkspaceMemberManagerProps) {
  const [newMemberUserId, setNewMemberUserId] = useState('');
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Ensure memberIds is always an array
  const memberIds = workspace.memberIds || [];

  const addMemberMutation = useAddWorkspaceMember();
  const removeMemberMutation = useRemoveWorkspaceMember();

  const handleAddMember = async () => {
    if (!newMemberUserId.trim()) return;

    // Check if member already exists
    if (memberIds.includes(newMemberUserId.trim())) {
      alert('This user is already a member of the workspace');
      return;
    }

    try {
      setIsAddingMember(true);
      await addMemberMutation.mutateAsync({
        workspaceId: workspace.workspaceId,
        userId: newMemberUserId.trim(),
      });
      setNewMemberUserId('');
      onMemberChange?.(); // Notify parent of member change
    } catch (error) {
      console.error('Failed to add member:', error);
      alert('Failed to add member. Please check the user ID and try again.');
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    // Don't allow removing the owner
    if (userId === workspace.ownerId) {
      alert('Cannot remove the workspace owner');
      return;
    }

    try {
      await removeMemberMutation.mutateAsync({
        workspaceId: workspace.workspaceId,
        userId,
      });
      setRemovingMemberId(null);
      onMemberChange?.(); // Notify parent of member change
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert('Failed to remove member. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddMember();
    }
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] bg-white border border-gray-200">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Manage Members - {workspace.title}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Add Member Section */}
            <div className="space-y-3">
              <Label htmlFor="newMember">Add New Member</Label>
              <div className="flex space-x-2">
                <Input
                  id="newMember"
                  placeholder="Enter user ID"
                  value={newMemberUserId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMemberUserId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddMember}
                  disabled={!newMemberUserId.trim() || isAddingMember}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  {isAddingMember ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Enter the user ID of the person you want to add to this workspace
              </p>
            </div>

            {/* Current Members Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Current Members ({memberIds.length})</Label>
              </div>

              {(workspace.memberIds || []).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No members in this workspace yet</p>
                  <p className="text-sm">Add members using the form above</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(workspace.memberIds || []).map((memberId) => (
                    <div
                      key={memberId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {memberId.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{memberId}</p>
                          {memberId === workspace.ownerId && (
                            <p className="text-xs text-gray-500">Owner</p>
                          )}
                        </div>
                      </div>
                      
                      {memberId !== workspace.ownerId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRemovingMemberId(memberId)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={onClose} variant="outline">
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <AlertDialog 
        open={!!removingMemberId} 
        onOpenChange={() => setRemovingMemberId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{removingMemberId}" from this workspace? 
              They will lose access to all projects and tasks within this workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removingMemberId && handleRemoveMember(removingMemberId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}