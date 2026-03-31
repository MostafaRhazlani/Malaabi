import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SearchScope = 'home' | 'favorites' | 'team' | 'global' | 'bookings';

interface SearchState {
  home: string;
  favorites: string;
  team: string;
  global: string;
  bookings: string;
}

const initialState: SearchState = {
  home: '',
  favorites: '',
  team: '',
  global: '',
  bookings: '',
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<{ scope: SearchScope; query: string }>) {
      const { scope, query } = action.payload;
      state[scope] = query;
    },
    clearSearchQuery(state, action: PayloadAction<SearchScope>) {
      state[action.payload] = '';
    },
  },
});

export const { setSearchQuery, clearSearchQuery } = searchSlice.actions;
export default searchSlice.reducer;
