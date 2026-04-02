import { createInitializer } from './factory'

const currentUrl = window.location.href
createInitializer(currentUrl, true).then(initializer => initializer?.init())
