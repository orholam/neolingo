let handlers = {
  prepareLogout: async () => {},
}

export function registerLearningSyncHandlers(next) {
  handlers = { ...handlers, ...next }
}

export async function prepareLearningLogout() {
  if (typeof handlers.prepareLogout === 'function') {
    await handlers.prepareLogout()
  }
}
