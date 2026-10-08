import { bindingMain } from '../../src/shell/binding.ts'
import { sveltePage } from '../../src/shell/pages/svelte.ts'

export default (): string => bindingMain(sveltePage)
