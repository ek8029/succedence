// Temporary in-memory storage until database tables are properly set up
// This is a development workaround

export interface TempNDA {
  id: string;
  listingId: string;
  buyerUserId: string;
  buyerName: string;
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export const tempNDAs: TempNDA[] = [];

export function getTempNDAs(listingId?: string): TempNDA[] {
  if (listingId) {
    return tempNDAs.filter(nda => nda.listingId === listingId);
  }
  return tempNDAs;
}

export function createTempNDA(data: Omit<TempNDA, 'id' | 'status' | 'createdAt' | 'updatedAt'>): TempNDA {
  const newNDA: TempNDA = {
    ...data,
    id: `temp-${Date.now()}`,
    status: 'REQUESTED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  tempNDAs.push(newNDA);
  return newNDA;
}

export function updateTempNDA(id: string, updates: Partial<TempNDA>): TempNDA | null {
  const ndaIndex = tempNDAs.findIndex(nda => nda.id === id);
  if (ndaIndex === -1) {
    return null;
  }

  tempNDAs[ndaIndex] = {
    ...tempNDAs[ndaIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  return tempNDAs[ndaIndex];
}

export function findTempNDA(id: string): TempNDA | null {
  return tempNDAs.find(nda => nda.id === id) || null;
}

export function findTempNDAByUser(listingId: string, buyerUserId: string): TempNDA | null {
  return tempNDAs.find(nda =>
    nda.listingId === listingId && nda.buyerUserId === buyerUserId
  ) || null;
}