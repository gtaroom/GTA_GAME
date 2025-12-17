  import { configureStore } from '@reduxjs/toolkit'
import { baseUserApi } from '../services/api/baseUserApi'
import authReducer from './slices/AuthSlice'
  // ...

  export const store = configureStore({
    reducer: {
      users: authReducer,
      [baseUserApi.reducerPath]: baseUserApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat([
        baseUserApi.middleware,
      ]),
  })

  // Infer the `RootState` and `AppDispatch` types from the store itself
  export type RootState = ReturnType<typeof store.getState>
  // Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
  export type AppDispatch = typeof store.dispatch