import { create } from 'zustand';

interface AssetEditData {
  editMode: boolean;
  itemId: number;
  itemType: string;
}

interface AssetEditStore {
  editData: AssetEditData | null;
  setEditData: (data: AssetEditData) => void;
  clearEditData: () => void;
}

export const useAssetEditStore = create<AssetEditStore>((set) => ({
  editData: null,
  setEditData: (data) => set({ editData: data }),
  clearEditData: () => set({ editData: null }),
}));
