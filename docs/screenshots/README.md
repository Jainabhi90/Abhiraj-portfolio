# Review evidence

`before-hero.jpg` and `before-work.jpg` capture the unchanged `portfolio-2.0` baseline. `after-hero.jpg` and `after-work.jpg` capture the correction in Chrome.

The browser suite generates six section images at four widths in three engines, totaling 72 PNGs. Four representative PNGs are tracked; the complete matrix remains available locally and can be regenerated using `npm run build && npm run test:e2e`. Viewport images wait for visible product imagery to finish loading. Screenshots are visual review evidence, not automated pixel-equality assertions against someone else's portfolio.
