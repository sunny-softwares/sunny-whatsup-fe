// Next 14 only ships ambient declarations for `*.module.css`, so a plain
// side-effect import like `import './globals.css'` has no type declaration.
// TypeScript 5.6+ reports that as an error (ts2882) in editors, though the
// bundler resolves it fine. Declaring the pattern here silences it; the more
// specific `*.module.css` declarations from `next/types/global.d.ts` still win.
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
