import { bindingMain } from '../../src/shell/binding.ts'
import { jqueryPage } from '../../src/shell/pages/jquery.ts'

export default (): string => bindingMain(jqueryPage)
