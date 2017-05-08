/**
 * This action type will be dispatched when your history
 * receives a location change.
 */
export const LOCATION_CHANGE = '@@router/LOCATION_CHANGE'

/**
 * This is our custom change to work with React Router v4. The differences is
 * that the reducer gets its initial state from history and the state shape
 * is slightly different
 */
export const createReducer = history => {
  const initState = {
    location: history.location,
    action: history.action,
  }
  return function reducer(state = initState, action) {
    if (action.type === LOCATION_CHANGE) {
      return {
        location: action.payload.location,
        action: action.payload.action,
      }
    }

    return state
  }
}
