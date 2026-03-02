# JavaScript Google Sheets Clone

Browser based spreadsheet application built with HTML,CSS, and Vanilla JavaScript featuring formula evaluation, dependency tracking and atuomatic recalculation.

## Features

- Dynamic 100x26 spreadsheet grid
- Editable cells with floating editor
- Formula support (e.g,=A1+B1)
- Dependency graph tracking
- Circular graph tracking
- Automatic recalculation of dependent cells
- Keyboard navigation (Arrow keys,Tab,Enter)
- Formula bar and address bar synchronization

## How It Works

Each cell is backed by a centralized data model (`sheetDB`)

When a formula is committed:
1. References are extracted.
2. Circular dependencies are checked.
3. The formula is evaluated.
4. All dependent cells are recursively recalculated.

The UI always reflects teh current state of the data model.

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript (No frameworks)

## Future Improvements 
- Support for built-in functions (SUM,AVG)
- Copy/paste and range selection

