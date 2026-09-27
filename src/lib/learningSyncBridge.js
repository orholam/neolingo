let handlers = {
  prepareLogout: async () => {},
  requestSync: () => {},
}

let hydrating = false

export function registerLearningSyncHandlers(next) {
  handlers = { ...handlers, ...next }
}

export async function prepareLearningLogout() {
  if (typeof handlers.prepareLogout === 'function') {
    await handlers.prepareLogout()
  }
}

export function setLearningHydrating(value) {
  hydrating = Boolean(value)
}

export function isLearningHydrating() {
  return hydrating
}

export function requestLearningSync() {
  if (typeof handlers.requestSync === 'function') {
    handlers.requestSync()
  }
}
