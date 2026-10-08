# @passcore/core

Framework-agnostic password strength scoring used by the `@passcore/*` meters. It has no dependencies and doesn't touch the DOM.

```bash
pnpm add @passcore/core
```

```ts
import { createMeter } from '@passcore/core'

const meter = createMeter({ minimumLength: 6 })
const { score, percent, text, style, textChanged } = meter.update('Tester23$', 'username')
```

- `score` is `-1` (shorter than `minimumLength`), `-2` (equal to or containing the field value) or `0` to `100`.
- `percent` is the score clamped to `0`..`100`.
- `text` is the message for the score (`enterPass` while the password is empty).
- `style` holds the inline styles for the color bar (`width` plus a background color or image offset).
- `textChanged` tells whether `text` differs from the previous update.

The lower-level functions are exported too: `calculateScore`, `scoreText`, `colorFromPercentage`, `barStyle` and `evaluate`.

The default stylesheet and the legacy color bar image are available at `@passcore/core/styles.css` and `@passcore/core/passwordstrength.jpg`.
