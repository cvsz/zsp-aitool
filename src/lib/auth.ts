export interface SessionLike { userId?: string; }
export function validateSession(session: SessionLike){ return Boolean(session.userId && session.userId.trim().length>0); }
