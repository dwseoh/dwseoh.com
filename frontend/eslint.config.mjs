import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // React Compiler-era rules that flag intentional patterns here: reading
    // window/matchMedia/localStorage after mount (hydration-safe), and writing
    // el.style on ref'd DOM nodes for animation. Kept visible, not blocking.
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', '.photos-backup/**']),
])
