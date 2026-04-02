import { createInitializer } from './factory'

const currentUrl = window.location.href
createInitializer(currentUrl).then(initializer => initializer?.init())
