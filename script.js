document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');

    // Configuration
    const COLS = 128;
    const ROWS = 128;

    // Common colors available
    const commonColors = [
        '#FF0000', // Red
        '#0000FF', // Blue
        '#00FF00', // Green
        '#000000', // Black
        '#FF7F00', // Orange
        '#FFFF00', // Yellow
        '#FF00FF', // Purple
        '#FFFFFF', // White
    ];

    // Set grid layout
    gridContainer.style.gridTemplateColumns = `repeat(${COLS}, 30px)`;
    gridContainer.style.gridTemplateRows = `repeat(${ROWS}, 30px)`;

    // Helper to get random color from common colors
    function getRandomColor() {
        return commonColors[Math.floor(Math.random() * commonColors.length)];
    }

    // Create cells
    for (let i = 0; i < COLS * ROWS; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        const initialColor = getRandomColor();
        cell.style.backgroundColor = initialColor;
        cell.dataset.index = i;

        // Log initial color
        const row = Math.floor(i / COLS);
        const col = i % COLS;
        console.log(`Cell [${row}, ${col}] (index: ${i}) initialized with color: ${initialColor}`);

        cell.addEventListener('click', (e) => {
            showColorInput(cell);
        });

        gridContainer.appendChild(cell);
    }

    function showColorInput(cell) {
        // Remove existing overlays if any
        const existing = document.querySelector('.color-input-wrapper');
        if (existing) existing.remove();

        const wrapper = document.createElement('div');
        wrapper.className = 'color-input-wrapper';

        const backdrop = document.createElement('div');
        backdrop.className = 'backdrop';
        backdrop.addEventListener('click', () => wrapper.remove());

        const overlay = document.createElement('div');
        overlay.className = 'color-input-overlay';

        // Use the common colors defined at the top

        const colorGrid = document.createElement('div');
        colorGrid.className = 'color-grid';

        commonColors.forEach(color => {
            const colorSwatch = document.createElement('div');
            colorSwatch.className = 'color-swatch';
            colorSwatch.style.backgroundColor = color;
            colorSwatch.title = color;

            colorSwatch.addEventListener('click', () => {
                const cellIndex = cell.dataset.index;
                const row = Math.floor(cellIndex / COLS);
                const col = cellIndex % COLS;

                cell.style.backgroundColor = color;
                console.log(`Cell [${row}, ${col}] (index: ${cellIndex}) changed to color: ${color}`);
                wrapper.remove();
            });

            colorGrid.appendChild(colorSwatch);
        });

        overlay.appendChild(colorGrid);
        wrapper.appendChild(backdrop);
        wrapper.appendChild(overlay);

        document.body.appendChild(wrapper);
    }
});
