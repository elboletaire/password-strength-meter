import { bindingMain } from '../../src/shell/binding.ts'
import { vanillaPage } from '../../src/shell/pages/vanilla.ts'

export default (): string => bindingMain(vanillaPage)
