
export function parseWorkspaceMemberIds(memberIds: string[] | string): string[] {
  if (!memberIds) return [];
  
  
  if (typeof memberIds === 'string') {
    memberIds = memberIds.split(',');
  }
  
  
  if (!Array.isArray(memberIds)) return [];
  
  const parsedIds: string[] = [];
  
  for (const memberId of memberIds) {
    if (!memberId || typeof memberId !== 'string') continue;
    
    const trimmedId = memberId.trim();
    if (!trimmedId) continue;
    
    
    if (trimmedId.startsWith('{') && trimmedId.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmedId);
        if (parsed.userId && typeof parsed.userId === 'string') {
          parsedIds.push(parsed.userId);
        }
      } catch (error) {
        
        console.warn('Failed to parse member ID JSON:', trimmedId);
      }
    } else {
      
      parsedIds.push(trimmedId);
    }
  }
  
  
  return [...new Set(parsedIds)];
}