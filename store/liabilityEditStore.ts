import { create } from 'zustand';

interface LiabilityEditData {
  editMode: boolean;
  itemId: number;
  itemType: string;
}

interface LiabilityEditStore {
  editData: LiabilityEditData | null;
  setEditData: (data: LiabilityEditData) => void;
  clearEditData: () => void;
}

export const useLiabilityEditStore = create<LiabilityEditStore>((set) => ({
  editData: null,
  setEditData: (data) => set({ editData: data }),
  clearEditData: () => set({ editData: null }),
}));
