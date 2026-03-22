import { create, StateCreator } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface BreadCrumbState {
  breadCrumb: string;
}

interface Actions {
  setBread: (nameBread: BreadCrumbState['breadCrumb']) => void;
}

const storeBread: StateCreator<BreadCrumbState & Actions> = (set) => ({
  breadCrumb: '',

  setBread: (breadCrumb) => {
    set({ breadCrumb });
  },
});

export const useUIStore = create<BreadCrumbState & Actions>()(
  devtools(
    storeBread,
    // persist(storeBread, {
    //   name: 'ui-storage',
    // }),
  ),
);
