// Utility function to parse workspace member IDs
export function parseWorkspaceMemberIds(memberIds: string[] | string): string[] {
  if (!memberIds) return [];
  
  // If it's a string, split by comma
  if (typeof memberIds === 'string') {
    memberIds = memberIds.split(',');
  }
  
  // If it's not an array, return empty array
  if (!Array.isArray(memberIds)) return [];
  
  const parsedIds: string[] = [];
  
  for (const memberId of memberIds) {
    if (!memberId || typeof memberId !== 'string') continue;
    
    const trimmedId = memberId.trim();
    if (!trimmedId) continue;
    
    // Check if it's a JSON object string
    if (trimmedId.startsWith('{') && trimmedId.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmedId);
        if (parsed.userId && typeof parsed.userId === 'string') {
          parsedIds.push(parsed.userId);
        }
      } catch (error) {
        // If parsing fails, skip this entry
        console.warn('Failed to parse member ID JSON:', trimmedId);
      }
    } else {
      // It's a plain string ID
      parsedIds.push(trimmedId);
    }
  }
  
  // Remove duplicates and return
  return [...new Set(parsedIds)];
}