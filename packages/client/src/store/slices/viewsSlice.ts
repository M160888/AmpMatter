import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ViewConfig, DEFAULT_VIEWS } from '@ampmatter/shared';

export interface ViewsState {
  views: ViewConfig[];
  currentViewId: string | null;
  editMode: boolean;
}

const initialState: ViewsState = {
  views: DEFAULT_VIEWS,
  currentViewId: 'navigation',
  editMode: false,
};

const viewsSlice = createSlice({
  name: 'views',
  initialState,
  reducers: {
    setViews: (state, action: PayloadAction<ViewConfig[]>) => {
      state.views = action.payload;
    },

    updateView: (state, action: PayloadAction<{ viewId: string; updates: Partial<ViewConfig> }>) => {
      const { viewId, updates } = action.payload;
      const index = state.views.findIndex((v) => v.id === viewId);
      if (index !== -1) {
        state.views[index] = { ...state.views[index], ...updates };
      }
    },

    reorderViews: (state, action: PayloadAction<string[]>) => {
      const viewIds = action.payload;
      const viewMap = new Map(state.views.map((v) => [v.id, v]));
      state.views = viewIds
        .map((id, index) => {
          const view = viewMap.get(id);
          if (view) {
            return { ...view, order: index };
          }
          return null;
        })
        .filter((v): v is ViewConfig => v !== null);
    },

    toggleViewEnabled: (state, action: PayloadAction<string>) => {
      const viewId = action.payload;
      const index = state.views.findIndex((v) => v.id === viewId);
      if (index !== -1) {
        state.views[index].enabled = !state.views[index].enabled;
      }
    },

    setCurrentView: (state, action: PayloadAction<string>) => {
      state.currentViewId = action.payload;
    },

    addCustomView: (state, action: PayloadAction<ViewConfig>) => {
      state.views.push(action.payload);
    },

    removeCustomView: (state, action: PayloadAction<string>) => {
      const viewId = action.payload;
      state.views = state.views.filter((v) => v.id !== viewId || v.type !== 'custom');
    },

    setEditMode: (state, action: PayloadAction<boolean>) => {
      state.editMode = action.payload;
    },

    resetViews: (state) => {
      state.views = DEFAULT_VIEWS;
      state.currentViewId = 'navigation';
      state.editMode = false;
    },
  },
});

export const {
  setViews,
  updateView,
  reorderViews,
  toggleViewEnabled,
  setCurrentView,
  addCustomView,
  removeCustomView,
  setEditMode,
  resetViews,
} = viewsSlice.actions;

export default viewsSlice.reducer;
