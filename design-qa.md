# Design QA — Wallet balance card

final result: passed

## Evidence

- Source visual truth: user attachment `D:/telegram/photo_2026-10-05_00-41-39.jpg` (364 × 193 px).
- Implementation: `http://localhost:5173/wallet`.
- Focused comparison capture: `http://localhost:5173/qa-comparison.html` (temporary review page; the source crop and live wallet card were shown together in the Codex In-app Browser, then the page and copied source image were removed).
- Implementation screenshot: CUA capture of `http://localhost:5173/wallet`, 633 × 715 px. The browser capture was not exported to a local image file.
- State: تومان selected, balance visible, allocation expanded.
- Density: CUA did not expose `deviceScaleFactor` separately. The comparison normalized the source card crop and implementation card to 358 × 170 CSS px, using one uniform scale factor for each.

## Comparison

- Full view: the live wallet page retains the existing mobile shell, account header, allocation summary, wallet actions, asset list, and bottom navigation. The card remains the first financial element above the fold.
- Focused card: the reference card measures approximately 297 × 141 px inside its attachment; the implementation measures 358 × 170 CSS px. Both have an approximately 2.1:1 card proportion, rounded corners, a fine blue edge, a large balance value, and an upward light-blue trend line.
- Typography: the reference uses English UI copy. The implementation keeps the wallet’s Persian RTL typography and uses the existing Inter/Vazirmatn stack for numeric display.
- Spacing and layout: unit selection, total balance, available balance, and total profit/loss fit inside the single card. The total remains the strongest text; the performance label and amount sit beside the trend line.
- Colors and tokens: the card uses a deep navy fill, muted blue border, high-contrast balance text, and light-blue chart line, matching the reference palette.
- Image and icon fidelity: the card contains no photo assets. The eye control uses the app’s existing icon library, and the line chart reuses the existing `Sparkline` component.
- Copy and content: the labels are localized to Persian. Toman/USDT values and profit/loss update with the selected unit; the available-balance line remains as existing wallet information.

## Interaction review

- Selecting تتر updates total, available balance, and profit/loss to USDT; selecting تومان restores Toman values.
- The eye control hides and restores total and available balances.

## Comparison history

1. Initial capture showed a card that was too tall for the reference proportion and a green trend line. The card was reduced from 216 px to 170 px, the allocation section was repositioned to follow it, and the trend line was changed to the reference’s light blue.
2. The focused comparison capture showed the revised card at a matching proportion with the selector, balance, performance copy, and chart all visible. No actionable P0, P1, or P2 differences remain.

## Follow-up polish

- The reference is English and omits the unit selector and available-balance line. The Persian labels and those wallet controls remain intentionally present in the implementation.
