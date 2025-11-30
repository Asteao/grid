document.addEventListener('DOMContentLoaded', async () => {
    const gridContainer = document.getElementById('grid-container');

    // Supabase Configuration
    // TODO: Replace with your actual project URL and Anon Key
    const SUPABASE_URL = 'https://tjxkocpazltaigaffekc.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqeGtvY3Bhemx0YWlnYWZmZWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MzY1MzQsImV4cCI6MjA4MDAxMjUzNH0.HvPImcuI3NABSbZAALWW_g0YuyoXRDCKbBdnLQMBjXc';

    // Initialize Supabase client
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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

    // Load initial state from Supabase
    let gridState = {};
    try {
        const { data, error } = await supabase
            .from('grid_state')
            .select('id, color');

        if (error) {
            console.error('Error loading grid state:', error);
        } else if (data) {
            data.forEach(row => {
                gridState[row.id] = row.color;
            });
            console.log(`Loaded ${data.length} cells from Supabase`);
        }
    } catch (e) {
        console.error('Unexpected error loading grid state:', e);
    }

    // Subscribe to realtime updates
    const channel = supabase
        .channel('grid_updates')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'grid_state' },
            (payload) => {
                console.log('Change received!', payload);
                const { new: newRecord } = payload;
                if (newRecord && newRecord.id !== undefined && newRecord.color) {
                    const cellIndex = newRecord.id;
                    const cell = gridContainer.children[cellIndex];
                    if (cell) {
                        cell.style.backgroundColor = newRecord.color;
                        // Update local state if needed, though direct DOM manipulation is sufficient for display
                        gridState[cellIndex] = newRecord.color;
                    }
                }
            }
        )
        .subscribe();

    // Create cells
    for (let i = 0; i < COLS * ROWS; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');

        // Use saved color if available, otherwise random
        const initialColor = gridState[i] || getRandomColor();
        cell.style.backgroundColor = initialColor;
        cell.dataset.index = i;

        // Log initial color (optional, reduced logging to avoid spamming console for 16k items)
        // if (i < 10) console.log(`Cell ${i} initialized`);

        cell.addEventListener('click', (e) => {
            showColorInput(cell);
        });

        gridContainer.appendChild(cell);
    }

    async function updateCellColor(index, color) {
        try {
            const { error } = await supabase
                .from('grid_state')
                .upsert({ id: parseInt(index), color: color });

            if (error) {
                console.error('Error updating cell:', error);
            } else {
                console.log(`Cell ${index} saved to Supabase`);
            }
        } catch (e) {
            console.error('Unexpected error updating cell:', e);
        }
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

                // Save to Supabase
                updateCellColor(cellIndex, color);

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
