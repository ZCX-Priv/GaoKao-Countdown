Based on your handwritten notes, I have designed the following plan to convert your idea into a PRD and initialize the project structure.

## Phase 1: Documentation (PRD)
I will create a `PRD.md` file containing the detailed specifications extracted from your notes:
1.  **Project Overview**: GaoKao Countdown (高考倒计时).
2.  **Tech Stack**: HTML5, CSS3, ES6+ JavaScript, IndexedDB (No external libraries).
3.  **Page Flow**: Loading Page -> Home Page.
4.  **Core Logic**:
    *   **Pre-Exam**: Countdown to June 7th 9:00 AM.
    *   **During Exam**: Countdown to June 9th 6:30 PM (End).
    *   **Post-Exam**: Countdown to next year's June 7th 9:00 AM.
5.  **UI/UX Design**:
    *   **Theme**: Blue & Orange, Liquid Glass effect (CSS+SVG), Mac "Genie" effect for popups.
    *   **Components**: iOS-style switches, Card layout.
6.  **Settings & Customization**:
    *   **Appearance**: Light/Dark/System, Theme Colors (Built-in), Bing Wallpaper.
    *   **Content**: Hitokoto (一言) types.
    *   **Toggles**: Milliseconds, Snow effect, Intro animation, Liquid effect.
    *   **Target**: Editable Event Name and Date.
7.  **File Structure**: As defined (styles/, scripts/, index.html).

## Phase 2: Project Initialization
After creating the PRD, I will set up the file structure exactly as you specified:
1.  **Root**: `index.html`
2.  **Styles Folder (`styles/`)**:
    *   `main.css` (Main layout)
    *   `background.css` (Background effects)
    *   `card.css` (Glassmorphism cards)
    *   `settings.css` (Settings panel)
    *   `themes.css` (Color themes)
    *   `notice.css` (Notifications)
3.  **Scripts Folder (`scripts/`)**:
    *   `main.js` (Entry point)
    *   `loading.js` (Loading screen)
    *   `time.js` (Countdown logic)
    *   `inspire.js` (Quotes/Hitokoto)
    *   `settings.js` (Configuration & IndexedDB)
    *   `notice.js` (Toast/Alerts)
4.  **Assets Folder (`assets/`)**: For images/SVGs.

I will start by creating the `PRD.md` for your review.