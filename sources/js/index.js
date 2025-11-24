        // Global variables
        let currentDay = null;
        let completedDays = new Set();
        let gameStates = {
            mosaic: { completed: false, progress: 0 },
            silhouette: { completed: false, progress: 0 },
            labyrinth: { completed: false },
            spices: { completed: false, progress: 0 },
            revelation: { completed: false }
        };
        let testMode = false;
        let currentLabPosition = 0;
        let finalCelebrationShown = false;
        let labyrinthSize = 8; // Tamaño del laberinto

        const targetDate = new Date('2025-11-23T00:00:00');

        // Mapeo día-juego
        const dayToGame = {
            19: 'mosaic',
            20: 'silhouette',
            21: 'labyrinth',
            22: 'spices',
            23: 'revelation'
        };

        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            initializeCountdown();
            initializeGames();
            loadProgress();
            updateDayLocks();
            selectInitialDay();
            document.addEventListener('click', handleClickOutside);
            const urlParams = new URLSearchParams(window.location.search);
    
            if (urlParams.get('hackTest') === 'true') {
                // Buscar y mostrar modeIndicator (quitar display: none)
                const modeIndicator = document.getElementById('modeIndicator');
                if (modeIndicator) {
                    modeIndicator.style.display = '';  // Quita el display: none y restaura al valor por defecto
                }
                
                // Buscar y mostrar testModeButton (quitar clase hidden)
                const testModeButton = document.getElementById('testModeButton');
                if (testModeButton) {
                    testModeButton.removeAttribute('hidden');
                }
            }
        });

        function selectInitialDay() {
            const today = new Date().getDate();
            
            if (testMode) {
                selectDay(19);
            } else {
                if (today >= 19 && today <= 23) {
                    selectDay(today);
                } else {
                    showInfoMessage('Ningún día disponible aún. ¡Vuelve el 19 de noviembre!');
                }
            }
        }

        // Test Mode Functionality
        function toggleTestMode() {
            testMode = !testMode;
            const button = document.getElementById('testModeButton');
            const indicator = document.getElementById('modeIndicator');
            
            button.setAttribute('aria-pressed', testMode);
            
            if (testMode) {
                button.textContent = '🔒 SALIR TEST';
                button.classList.add('active');
                indicator.textContent = 'Modo Test';
                indicator.classList.add('test-mode');
                
                document.querySelectorAll('.day-button').forEach(btn => {
                    btn.classList.remove('locked');
                    btn.setAttribute('aria-disabled', 'false');
                });
                
                showInfoMessage('🧪 Modo TEST activado - Todos los juegos desbloqueados!');
                selectDay(19);
            } else {
                button.textContent = '🧪 MODO TEST';
                button.classList.remove('active');
                indicator.textContent = 'Modo Normal';
                indicator.classList.remove('test-mode');
                
                updateDayLocks();
                showInfoMessage('🔒 Modo TEST desactivado - Regreso al modo normal');
                selectInitialDay();
            }
            
            createCelebrationParticles();
        }

        // Countdown functionality
        function initializeCountdown() {
            updateCountdown();
            setInterval(updateCountdown, 1000);
        }

        function updateCountdown() {
            const now = new Date();
            const difference = targetDate - now;

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                document.getElementById('days').textContent = String(days).padStart(2, '0');
                document.getElementById('hours').textContent = String(hours).padStart(2, '0');
                document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
                document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
            } else {
                document.getElementById('countdownMessage').textContent = '¡La sorpresa está disponible! 🎉';
                document.getElementById('days').textContent = '00';
                document.getElementById('hours').textContent = '00';
                document.getElementById('minutes').textContent = '00';
                document.getElementById('seconds').textContent = '00';
            }
        }

        // Day selection functionality
        function selectDay(day) {
            const today = new Date().getDate();
            const isAvailable = (day === today) || testMode;
            
            if (!isAvailable) {
                showInfoMessage('Este día aún no está disponible. ¡Vuelve en la fecha correspondiente!');
                return;
            }

            currentDay = day;
            
            // Resetear posición del laberinto si se selecciona día 21
            if (day === 21) {
                resetLabyrinth();
            }
            
            // Actualizar botones
            document.querySelectorAll('.day-button').forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });
            const activeButton = document.getElementById(`day${day}`);
            activeButton.classList.add('active');
            activeButton.setAttribute('aria-pressed', 'true');
            
            // Mostrar juego correspondiente
            document.querySelectorAll('.game-card').forEach(card => {
                card.classList.remove('active');
            });
            document.getElementById(`game${day}`).classList.add('active');
        }

        // Resetear visualización del laberinto - CORREGIDO
        function resetLabyrinth() {
            currentLabPosition = 0; // Resetear posición a inicio
            
            const cells = document.querySelectorAll('.labyrinth-cell-advanced');
            cells.forEach((cell, index) => {
                // Solo quitar 'visited' de celdas normales, NO de inicio
                if (!cell.classList.contains('start') && !cell.classList.contains('end') && !cell.classList.contains('wall')) {
                    cell.classList.remove('visited');
                }
            });
            
            // Asegurar que la celda de inicio sea visible y marcada
            const startCell = document.querySelector('.labyrinth-cell-advanced.start');
            if (startCell) {
                startCell.classList.add('visited');
            }
        }

        // Update day locks based on current date and progress
        function updateDayLocks() {
            const today = new Date().getDate();
            
            for (let day = 19; day <= 23; day++) {
                const button = document.getElementById(`day${day}`);
                const isAvailable = (day === today); // Solo el día exacto
                
                if (isAvailable) {
                    button.classList.remove('locked');
                    button.setAttribute('aria-disabled', 'false');
                } else {
                    button.classList.add('locked');
                    button.setAttribute('aria-disabled', 'true');
                }
            }
        }

        // Initialize all games
        function initializeGames() {
            initializeMosaicAdvanced();
            initializeSilhouetteAdvanced();
            initializeLabyrinthAdvanced();
            initializeSpicePuzzle();
            initializeRevelationAdvanced();
        }

        // Game 1: Advanced Mosaic
        function initializeMosaicAdvanced() {
            const grid = document.getElementById('mosaicAdvanced');
            const patterns = [
                '🌟', '🌙', '☀️', '🌺', '🌸',
                '🦋', '🐍', '🦅', '🐪', '🐫',
                '🔮', '💎', '🏺', '🗝️', '🔱',
                '🕌', '🏰', '🏜️', '🌊', '⛰️',
                '✨', '💫', '🌟', '⭐', '🌠'
            ];
            
            const solutionPattern = [
                [0, 1, 2, 3, 4],
                [5, 6, 7, 8, 9],
                [10, 11, 12, 13, 14],
                [15, 16, 17, 18, 19],
                [20, 21, 22, 23, 24]
            ];
            
            for (let i = 0; i < 25; i++) {
                const tile = document.createElement('div');
                tile.className = 'mosaic-tile';
                tile.dataset.index = i;
                tile.dataset.rotation = '0';
                tile.dataset.correctRotation = Math.floor(Math.random() * 4) * 90;
                
                const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
                tile.textContent = randomPattern;
                tile.style.background = `linear-gradient(${Math.random() * 360}deg, #8B4513, #D2691E, #F4A460)`;
                
                tile.addEventListener('click', function() {
                    rotateMosaicTile(tile, solutionPattern);
                });
                
                grid.appendChild(tile);
            }
        }

        function rotateMosaicTile(tile, solution) {
            if (gameStates.mosaic.completed) {
                showSuccessMessageButton('¡Ya has completado el Mosaico mágico!, revisa la imagen y encuentra el mensaje secreto, guarda este mensaje será importante más adelante',()=>{
                    const popupOverlay = document.getElementById('popupOverlay');
                    const popupImage = document.getElementById('popupImage');
                    const popupClose = document.getElementById('popupClose');
                    
                    // Abrir popup con imagen
                    function showPopup(imgSrc) {
                        popupImage.src = imgSrc;
                        popupOverlay.style.display = 'flex';
                    }
                    
                    // Cerrar popup
                    function closePopup() {
                        popupOverlay.style.display = 'none';
                        popupImage.src = "";
                    }
                    
                    popupClose.addEventListener('click', closePopup);
                    
                    showPopup("https://raw.githubusercontent.com/pacoDevelop/birthday-/refs/heads/main/sources/imgs/sis.jpg");
                });
                return
            };
            
            const currentRotation = parseInt(tile.dataset.rotation);
            const newRotation = (currentRotation + 90) % 360;
            
            tile.style.transform = `rotate(${newRotation}deg)`;
            tile.dataset.rotation = newRotation;
            
            checkMosaicAdvancedCompletion(solution);
        }

        function checkMosaicAdvancedCompletion() {
            const tiles = document.querySelectorAll('.mosaic-tile');
            let correctCount = 0;
        
            tiles.forEach(tile => {
                const rotation = parseInt(tile.dataset.rotation) || 0;
                const correctRotation = parseInt(tile.dataset.correctRotation) || 0;
        
                if (rotation === correctRotation) {
                    tile.classList.add('correct');
                    correctCount++;
                } else {
                    tile.classList.remove('correct');
                }
            });
        
            const progress = (correctCount / tiles.length) * 100;
            document.getElementById('mosaicProgress').style.width = progress + '%';
            gameStates.mosaic.progress = progress;
        
            // Solo se ejecuta UNA vez cuando se completa
            if (correctCount === tiles.length && !gameStates.mosaic.completed) {
                gameStates.mosaic.completed = true;
                completedDays.add(19);
                updateProgress();
                showSuccessMessageButton('¡Mosaico mágico completado perfectamente!, revisa la imagen y encuentra el mensaje secreto, guarda este mensaje será importante más adelante',()=>{
                    const popupOverlay = document.getElementById('popupOverlay');
                    const popupImage = document.getElementById('popupImage');
                    const popupClose = document.getElementById('popupClose');

                    
                    // Abrir popup con imagen
                    function showPopup(imgSrc) {
                        popupImage.src = imgSrc;
                        popupOverlay.style.display = 'flex';
                    }
                    
                    // Cerrar popup
                    function closePopup() {
                        popupOverlay.style.display = 'none';
                        popupImage.src = "";
                    }
                    
                    popupClose.addEventListener('click', closePopup);
                    
                    showPopup("https://raw.githubusercontent.com/pacoDevelop/birthday-/refs/heads/main/sources/imgs/sis.jpg");
                });
                createCelebrationParticles();
            }
        }
        
        
        // Game 2: Advanced Silhouette
        function initializeSilhouetteAdvanced() {
            const container = document.getElementById('silhouetteAdvanced');
            const objects = [
                { emoji: '🏮', name: 'lamp', shape: 'round' },
                { emoji: '🫖', name: 'teapot', shape: 'tall' },
                { emoji: '🧺', name: 'basket', shape: 'wide' },
                { emoji: '🕌', name: 'mosque', shape: 'tower' },
                { emoji: '🪙', name: 'coin', shape: 'circle' },
                { emoji: '🧿', name: 'eye', shape: 'oval' }
            ];
            
            const game20 = document.getElementById('game20'); 
            
            const shuffledObjects = [...objects].sort(() => Math.random() - 0.5);
            
            objects.forEach((obj, index) => {
                const pair = document.createElement('div');
                pair.className = 'silhouette-pair';
                
                const target = document.createElement('div');
                target.className = 'silhouette-target';
                target.dataset.shape = obj.name;
                
                const object = document.createElement('div');
                object.classList.add('silhouette-object', 'no-select');
                object.textContent = shuffledObjects[index].emoji;
                object.dataset.shape = shuffledObjects[index].name;
                object.draggable = true;
                
                object.addEventListener('dragstart', handleDragStart);
                object.addEventListener('dragend', handleDragEnd);
                
                target.addEventListener('dragover', handleDragOver);
                target.addEventListener('drop', handleSilhouetteAdvancedDrop);
                game20.addEventListener('click', ()=>{
                    if(gameStates.silhouette.completed){
                        showSuccessMessageButton('¡Ya está completado Siluetas!, ¿lo de ayer fue complicado?, resuelve el enigma de hoy para obtener el siguiente mensaje, recuerda guardar los mensajes.',()=>{
                            const popupOverlayIframe = document.getElementById('popupOverlayIframe');
                            const popupIframe = document.getElementById('popupIframe');
                            const popupCloseIframe = document.getElementById('popupCloseIframe');
                            
                            // Abrir popup con imagen
                            function showPopup(imgSrc) {
                                popupIframe.src = imgSrc;
                                popupOverlayIframe.style.display = 'flex';
                            }
                            
                            // Cerrar popup
                            function closePopup() {
                                popupOverlayIframe.style.display = 'none';
                                popupImage.src = "https://ruwix.com/secret/?message=F&lang=es";
                            }
                            
                            popupCloseIframe.addEventListener('click', closePopup);
                            
                            showPopup("https://ruwix.com/secret/?message=F&lang=es");
                        });
                        return
                    }
                });
                
                pair.appendChild(target);
                pair.appendChild(object);
                container.appendChild(pair);
            });
            
        }

        function handleSilhouetteAdvancedDrop(e) {
            e.preventDefault();
            const draggedElement = document.querySelector('.dragging');
            const targetSlot = e.target.closest('.silhouette-target');
            
            if (draggedElement && targetSlot) {
                const draggedShape = draggedElement.dataset.shape;
                const targetShape = targetSlot.dataset.shape;
                
                if (draggedShape === targetShape && !targetSlot.classList.contains('correct')) {
                    targetSlot.appendChild(draggedElement);
                    targetSlot.classList.add('correct');
                    draggedElement.draggable = false;
                    draggedElement.style.display = 'none';
                    
                    const correctPairs = document.querySelectorAll('.silhouette-target.correct').length;
                    const totalPairs = document.querySelectorAll('.silhouette-target').length;
                    const progress = (correctPairs / totalPairs) * 100;
                    
                    document.getElementById('silhouetteProgress').style.width = progress + '%';
                    gameStates.silhouette.progress = progress;
                    
                    if (correctPairs === totalPairs && !gameStates.silhouette.completed) {
                        gameStates.silhouette.completed = true;
                        completedDays.add(20);
                        updateProgress();
                        showSuccessMessageButton('¡Siluetas completadas!, ¿lo de ayer fue complicado?, resuelve el enigma de hoy para obtener el siguiente mensaje, recuerda guardar los mensajes.',()=>{
                                const popupOverlayIframe = document.getElementById('popupOverlayIframe');
                                const popupIframe = document.getElementById('popupIframe');
                                const popupCloseIframe = document.getElementById('popupCloseIframe');
                                
                                // Abrir popup con imagen
                                function showPopup(imgSrc) {
                                    popupIframe.src = imgSrc;
                                    popupOverlayIframe.style.display = 'flex';
                                }
                                
                                // Cerrar popup
                                function closePopup() {
                                    popupOverlayIframe.style.display = 'none';
                                    popupImage.src = "";
                                }
                                
                                popupCloseIframe.addEventListener('click', closePopup);
                                
                                showPopup("https://ruwix.com/secret/?message=F&lang=es");
                            });
                            return
                        };
                        createCelebrationParticles();
                    }
                }
            }
        

        // Game 3: Advanced Labyrinth - CORREGIDO y OPTIMIZADO
        // Inicializa y renderiza el laberinto (funciona para rectángulos)
    function initializeLabyrinthAdvanced() {
        
        const grid = document.getElementById('labyrinthAdvanced');
        if (!grid) {
            console.error('No existe el elemento #labyrinthAdvanced');
            return;
        }
    
        // Tu laberinto (puedes cambiar tamaño/filas)
        const labyrinth = [
             [0, 0, 0, 1, 0, 0, 0,0,0,0], 
    [1, 1, 0, 1, 0, 1, 0,1,1,0], 
    [0, 1, 0, 1, 0, 1, 0,1,0,0],
    [0, 0, 0, 0, 0, 1, 0,1,0,1],
    [1, 1, 1, 1, 0, 1, 0,1,0,1],
    [0, 0, 0, 1, 0, 0, 0,1,0,0],
    [0, 1, 0, 1, 1, 1, 1,1,1,0],
    [0, 1, 0, 0, 0, 1, 0,1,0,0],
    [0, 1, 1, 1, 0, 0, 1,1,0,1],
    [0, 0, 0, 0, 0, 0, 0,0,0,1],
    [0, 1, 1, 0, 1, 1, 1,1,0,1],
    [0, 0, 1, 0, 0, 0, 0,1,0,0],
    [0, 1, 1, 1, 1, 1, 0,1,1,0],
    [0, 1, 0, 0, 0, 0, 0,1,0,0],
    [0, 1, 0, 1, 1, 1, 1,1,0,1],
    [0, 1, 0, 0, 0, 0, 2,0,1,1]
        ];
        
        
    
        // Normalizar dimensiones: filas reales y columnas máximas
        const rows = labyrinth.length;
        const cols = Math.max(...labyrinth.map(r => r.length));
    
        // Asegurar que cada fila tenga longitud 'cols' (rellenar con muros si hiciera falta)
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (typeof labyrinth[r][c] === 'undefined') labyrinth[r][c] = 1;
            }
        }
    
        // Estilo del grid para que cuadre visualmente
        grid.innerHTML = '';
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        grid.style.gap = '4px'; // opcional
    
        // Buscar posición inicial válida (si (0,0) no fuera caminable)
        let startIndex = 0;
        if (labyrinth[0][0] === 1) {
            let found = false;
            for (let r = 0; r < rows && !found; r++) {
                for (let c = 0; c < cols && !found; c++) {
                    if (labyrinth[r][c] === 0) {
                        startIndex = r * cols + c;
                        found = true;
                    }
                }
            }
            if (!found) {
                console.error('No hay celdas caminables en el laberinto.');
                return;
            }
        }
    
            // Renderizar celdas
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const index = row * cols + col;
                    const cell = document.createElement('div');
                    cell.className = 'labyrinth-cell-advanced';
                    cell.dataset.index = index;
                    cell.style.minHeight = '28px'; // útil para ver las celdas, ajustar CSS a tu gusto
                    cell.style.display = 'flex';
                    cell.style.alignItems = 'center';
                    cell.style.justifyContent = 'center';
                    cell.style.userSelect = 'none';
        
                    const cellType = labyrinth[row][col];
        
                    if (cellType === 1) {
                        cell.classList.add('wall');
                        // opcional: estilo rápido si no tienes CSS
                        // cell.style.background = '#333';
                    } else if (cellType === 2) {
                        cell.classList.add('end');
                        cell.textContent = '🏆';
                    } else if (index === startIndex) {
                        cell.classList.add('start');
                        cell.textContent = '🏁';
                        cell.classList.add('visited');
                    }
        
                    if (cellType !== 1) {
                        // paso cols para cálculos correctos en handlers
                        cell.addEventListener('click', (e) => handleLabyrinthClick(index, labyrinth, cols, e));
                        // accesible mediante teclado si quieres (opcional)
                        cell.tabIndex = 0;
                    } else {
                        cell.setAttribute('aria-hidden', 'true');
                    }
        
                    grid.appendChild(cell);
                }
            }
        
            currentLabPosition = startIndex;
            gameStates.labyrinth.completed = false;
    }

    // Handler del click (usa cols para cálculo correcto en matrices rectangulares)
    function handleLabyrinthClick(index, labyrinth, cols, event) {
        if (gameStates.labyrinth.completed) {
            showSuccessMessageButton('¡Laberinto completado! Ya encontraste el camino, ¿un cubo de rubick complicado el de ayer?, resuelve el puzzle de hoy para ver en la imagen el mensaje, observa bien, recuerda guardar los mensajes.',()=>{
                const popupOverlayIframe = document.getElementById('popupOverlayIframe');
                const popupIframe = document.getElementById('popupIframe');
                const popupCloseIframe = document.getElementById('popupCloseIframe');
                
                // Abrir popup con imagen
                function showPopup(imgSrc) {
                    popupIframe.src = imgSrc;
                    popupOverlayIframe.style.display = 'flex';
                }
                
                // Cerrar popup
                function closePopup() {
                    popupOverlayIframe.style.display = 'none';
                    popupImage.src = "";
                }
                
                popupCloseIframe.addEventListener('click', closePopup);
                
                showPopup("https://www.jigsawplanet.com/?rc=play&pid=15fb82fb938c&view=iframe&bgcolor=0xc8872d");
            });
            return
        };
    
        // Safety: si no viene event, buscar el elemento por dataset
        const clickedCell = event && event.currentTarget ? event.currentTarget : document.querySelector(`[data-index="${index}"]`);
        if (!clickedCell) return;
    
        const row = Math.floor(index / cols);
        const col = index % cols;
    
        // Si por algún motivo la celda es muro o fuera de rango
        if (!labyrinth[row] || labyrinth[row][col] === 1) {
            console.log('clic en pared o fuera de rango', row, col);
            return;
        }
    
        // No permitir movimientos no adyacentes
        if (!isAdjacent(currentLabPosition, index, cols)) {
            console.log('Movimiento no adyacente:', currentLabPosition, '→', index);
            return;
        }
    
        // Marcar visitada y actualizar posición
        clickedCell.classList.add('visited');
        currentLabPosition = index;
    
        // Verificar meta
        if (labyrinth[row][col] === 2) {
            gameStates.labyrinth.completed = true;
            console.log('Meta alcanzada en', row, col);
            if (typeof completedDays !== 'undefined' && completedDays.add) completedDays.add(21);
            if (typeof updateProgress === 'function') updateProgress();
            if (typeof showSuccessMessage === 'function') showSuccessMessageButton('¡Laberinto completado! Has encontrado el camino, ¿un cubo de rubick complicado el de ayer?, resuelve el puzzle de hoy para ver en la imagen el mensaje, observa bien, recuerda guardar los mensajes.',()=>{
                const popupOverlayIframe = document.getElementById('popupOverlayIframe');
                const popupIframe = document.getElementById('popupIframe');
                const popupCloseIframe = document.getElementById('popupCloseIframe');
                
                // Abrir popup con imagen
                function showPopup(imgSrc) {
                    popupIframe.src = imgSrc;
                    popupOverlayIframe.style.display = 'flex';
                }
                
                // Cerrar popup
                function closePopup() {
                    popupOverlayIframe.style.display = 'none';
                    popupImage.src = "";
                }
                
                popupCloseIframe.addEventListener('click', closePopup);
                
                showPopup("https://www.jigsawplanet.com/?rc=play&pid=15fb82fb938c&view=iframe&bgcolor=0xc8872d");
            });
            if (typeof createCelebrationParticles === 'function') createCelebrationParticles();
        }
    }

    // Adyacencia correcta usando 'cols' (funciona para rectangular)
    function isAdjacent(pos1, pos2, cols) {
        const r1 = Math.floor(pos1 / cols);
        const c1 = pos1 % cols;
        const r2 = Math.floor(pos2 / cols);
        const c2 = pos2 % cols;
        return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
    }

        // Game 4: Advanced Spice Puzzle
        function initializeSpicePuzzle() {
            const grid = document.getElementById('spicePuzzle');
            const spices = ['🌶️', '🫚', '🌿', '🧄', '🧅', '🍋', '🥥', '🌰', '🍯', '🌾', '🍃', '⚫', '🔴', '🟡', '🟤', '🟢', '⚪', '🔵', '🟣', '🟠', '🔶', '🔷', '🔸', '🔹', '🔺'];
            
            const solution = [
                ['🌶️', '🫚', '🌿', '🧄', '🧅'],
                ['🍋', '🥥', '🌰', '🍯', '🌾'],
                ['🍃', '⚫', '🔴', '🟡', '🟤'],
                ['🟢', '🌶️', '🫚', '🌿', '🧄'],
                ['🍋', '🥥', '🌰', '🍯', '🌾']
            ];
            
            for (let i = 0; i < 25; i++) {
                const cell = document.createElement('div');
                cell.className = 'spice-cell-advanced';
                cell.dataset.index = i;
                cell.dataset.current = '0';
                
                const randomSpice = spices[Math.floor(Math.random() * spices.length)];
                cell.textContent = randomSpice;
                cell.dataset.currentSpice = randomSpice;
                
                cell.addEventListener('click', function() {
                    cycleSpiceCell(cell, spices, solution, i);
                });
                
                grid.appendChild(cell);
            }
        }

        function cycleSpiceCell(cell, spices, solution, index) {
            if (gameStates.spices.completed) {
                
                showSuccessMessageButtonExt('¡Ya completaste el Puzzle de especias!, ¿que tal se te dio el puzzle de ayer?, resuelve este otro puzzle mas complicado de hoy para ver en la imagen el mensaje,fíjate bien, recuerda guardar los mensajes.',()=>{
                window.open("https://puzzel.org/es/slidingpuzzle/play?p=-OeNcw1uXDiuWkS1hERU", '_blank');
            });
                return
                
            }; // No permitir si ya completado
            
            const currentSpice = cell.dataset.currentSpice;
            const currentIndex = spices.indexOf(currentSpice);
            const nextIndex = (currentIndex + 1) % spices.length;
            const nextSpice = spices[nextIndex];
            
            cell.textContent = nextSpice;
            cell.dataset.currentSpice = nextSpice;
            
            const row = Math.floor(index / 5);
            const col = index % 5;
            
            if (nextSpice === solution[row][col]) {
                cell.classList.add('correct');
                cell.classList.remove('incorrect');
            } else {
                cell.classList.add('incorrect');
                cell.classList.remove('correct');
                setTimeout(() => {
                    cell.classList.remove('incorrect');
                }, 500);
            }
            
            checkSpicePuzzleCompletion(solution);
        }

        function checkSpicePuzzleCompletion(solution) {
            const cells = document.querySelectorAll('.spice-cell-advanced');
            let correctCount = 0;
            
            cells.forEach((cell, index) => {
                const row = Math.floor(index / 5);
                const col = index % 5;
                const currentSpice = cell.dataset.currentSpice;
                
                if (currentSpice === solution[row][col]) {
                    correctCount++;
                }
            });
            
            const progress = (correctCount / cells.length) * 100;
            document.getElementById('spiceProgress').style.width = progress + '%';
            gameStates.spices.progress = progress;
            
            if (correctCount === cells.length && !gameStates.spices.completed) {
                gameStates.spices.completed = true;
                completedDays.add(22);
                updateProgress();
                showSuccessMessageButtonExt('¡Puzzle de especias completado!, ¿que tal se te dio el puzzle de ayer?, resuelve este otro puzzle mas complicado de hoy para ver en la imagen el mensaje,fijate bien, recuerda guardar los mensajes.',()=>{
                window.open("https://puzzel.org/es/slidingpuzzle/play?p=-OeNcw1uXDiuWkS1hERU", '_blank');
            });
                createCelebrationParticles();
            }
        }

        // Game 5: Advanced Revelation
        function initializeRevelationAdvanced() {
            const chest = document.getElementById('treasureChest');
            const content = document.getElementById('revelationContent');
            
            chest.addEventListener('click', function() {
                if (!gameStates.revelation.completed) {
                    chest.classList.add('open');
                    
                    setTimeout(() => {
                        content.classList.add('show');
                    }, 500);
                    
                    showSuccessMessageButtonFinal('¡Felicidades! Has completado todos los desafíos. Bienvenida al último desafio, una pregunta y una respuesta.\nTiene 27 primaveras, un espíritu libre y un corazón que late al ritmo de aventuras inesperadas. Es única en el mundo, pero solo quien la conoce de verdad puede descifrarla. ¿Sabes su nombre?',() => {
                            // Tomar el valor del input y convertirlo a minúsculas
                            const input = document.getElementById('finalInput');
                            const resultado = document.getElementById('resultado');
                            const valor = input.value.trim().toLowerCase();
                            
                            if (valor === 'nerea') {
                                const messageText = document.getElementById('successTextFinal');
                                messageText.hidden = true;
                                resultado.textContent = '¡Correcto! ¿Te gustaron las flores? Tu última letra secreta es el error del mensaje de las flores.\nOrdena todas las letras encontradas y formarás la palabra secreta que tendrás que enviarsela a la cuenta de instagram que inicio todos estos retos.\n Pulsa sobre los iconos de las cámaras...';
                                gameStates.revelation.completed = true;
                                completedDays.add(23);
                                updateProgress();
                                 // Celebración final (solo una vez)
                                setTimeout(() => {
                                    if (!finalCelebrationShown) {
                                        createFinalCelebration();
                                        finalCelebrationShown = true;
                                    }
                                }, 2000);
                            } else {
                                resultado.textContent = 'El valor no coincide. Sigue intentandolo 😞 .';
                            }
                        });
                    
                }
            });
        }

        function addPhoto(slotNumber) {
            const imgs=["https://i.ibb.co/Dhy9BVr/Whats-App-Image-2025-11-19-at-13-48-04.jpg","https://i.ibb.co/CKSxVZT4/Whats-App-Image-2025-11-19-at-13-46-14.jpg","https://i.ibb.co/LdGpFqnd/Whats-App-Image-2025-11-19-at-13-45-18.jpg","https://i.ibb.co/rq3dx5t/Whats-App-Image-2025-11-19-at-13-44-36.jpg"]
            const slot = document.querySelector(`#photoGallery .photo-slot:nth-child(${slotNumber})`);
            slot.style.border=''
            slot.innerHTML  = '<img class="photo" src="'+imgs[slotNumber-1]+'" alt="Imagen">';
            slot.style.background = '';
            slot.style.animation = 'correctTile 0.6s ease-out';
        }

        // Utility functions
        function handleDragStart(e) {
            if (gameStates.silhouette.completed) return;
            e.target.classList.add('dragging');
            e.dataTransfer.setData('text/plain', '');
        }

        function handleDragEnd(e) {
            e.target.classList.remove('dragging');
        }

        function handleDragOver(e) {
            e.preventDefault();
        }

        function handleClickOutside(e) {
            // Cerrar hints si se hace clic fuera
            const hints = document.querySelectorAll('.hint-tooltip.show');
            hints.forEach(hint => {
                if (!hint.contains(e.target) && !e.target.classList.contains('hint-button')) {
                    hint.classList.remove('show');
                }
            });
        }

        function updateProgress() {
            const totalDays = 5;
            const completed = completedDays.size;
            const progress = (completed / totalDays) * 100;
            
            document.getElementById('progressFill').style.width = progress + '%';
            document.getElementById('progressText').textContent = `${completed}/${totalDays} completado`;
            for (let day of completedDays) {
                const dayButton = document.getElementById('day'+day);
                dayButton.textContent = 'Día '+day+' ✓'; 
            }
            localStorage.setItem('moroccanBirthdayProgress', JSON.stringify({
                completedDays: Array.from(completedDays),
                gameStates: gameStates
            }));
        }

        function loadProgress() {
            const saved = localStorage.getItem('moroccanBirthdayProgress');
            if (saved) {
                const data = JSON.parse(saved);
                completedDays = new Set(data.completedDays);
                const totalDays = 5;
                const progress = (completedDays.size / totalDays) * 100;
                document.getElementById('progressFill').style.width = progress + '%';
                document.getElementById('progressText').textContent = `${completedDays.size}/${totalDays} completado`;
                for (let day of completedDays) {
                    const dayButton = document.getElementById('day'+day);
                    dayButton.textContent = 'Día '+day+' ✓'; 
                }
                gameStates = data.gameStates;
                
                restoreGameStates();
            }
        }

        function restoreGameStates() {
            // Restaurar visualización de juegos completados
            if (gameStates.mosaic.completed) {
                document.querySelectorAll('.mosaic-tile').forEach(tile => {
                    tile.classList.add('correct');
                });
                document.getElementById('mosaicProgress').style.width = '100%';
            }
            
            if (gameStates.silhouette.completed) {
                document.querySelectorAll('.silhouette-target').forEach(target => {
                    target.classList.add('correct');
                });
                document.getElementById('silhouetteProgress').style.width = '100%';
            }
            
            if (gameStates.spices.completed) {
                document.querySelectorAll('.spice-cell-advanced').forEach(cell => {
                    cell.classList.add('correct');
                });
                document.getElementById('spiceProgress').style.width = '100%';
            }
            
            if (gameStates.revelation.completed) {
                document.getElementById('treasureChest').classList.add('open');
                document.getElementById('revelationContent').classList.add('show');
                finalCelebrationShown = true;
            }
            
            const grid = document.getElementById('labyrinthAdvanced');
            if (!grid) {
                console.error('No existe el elemento #labyrinthAdvanced');
                return;
            }
            if (gameStates.labyrinth.completed) {
                const gradiente = 'linear-gradient(135deg, #87ff87, #ffffff)';
                grid.style.background = gradiente;
            
        }
        }

        function toggleHint(hintId) {
            const hint = document.getElementById(hintId);
            const allHints = document.querySelectorAll('.hint-tooltip');
            
            allHints.forEach(h => {
                if (h.id !== hintId) {
                    h.classList.remove('show');
                }
            });
            
            hint.classList.toggle('show');
            
            if (hint.classList.contains('show')) {
                setTimeout(() => {
                    hint.classList.remove('show');
                }, 5000);
            }
        }
        
        function showSuccessMessage(text) {
            const modal = document.getElementById('successMessage');
            const messageText = document.getElementById('successText');
            
            messageText.textContent = text;
            modal.classList.add('show');
            const successClose = document.getElementById('successClose')
            successClose.addEventListener('click', () => {
                modal.classList.remove('show');
            });
            setTimeout(() => {
               if (modal?.classList.contains('show')) {
                    modal.classList.remove('show');
                }
            }, 4000);
        }

        function showSuccessMessageButton(text,handleButton) {
            const modal = document.getElementById('successMessage');
            const messageText = document.getElementById('successText');
            
            messageText.textContent = text;
            modal.classList.add('show');
            
            const successClose = document.getElementById('successClose')
            successClose.addEventListener('click', () => {
                modal.classList.remove('show');
            });
            setTimeout(() => {handleButton();}, 12000);
        }
        
        function showSuccessMessageButtonExt(text,handleButton) {
            const modal = document.getElementById('successMessageExt');
            const messageText = document.getElementById('successTextExt');
            
            messageText.textContent = text;
            modal.classList.add('show');
            
            const successClose = document.getElementById('successCloseExt')
            successClose.addEventListener('click', () => {
                modal.classList.remove('show');
            });
            document.getElementById('openPuzzle').addEventListener('click', handleButton);
        }
        
        function showSuccessMessageButtonFinal(text,handleButton) {
            const modal = document.getElementById('successMessageFinal');
            const messageText = document.getElementById('successTextFinal');
            
            messageText.textContent = text;
            modal.classList.add('show');
            
            const successClose = document.getElementById('successCloseFinal')
            successClose.addEventListener('click', () => {
                modal.classList.remove('show');
            });
            document.getElementById('buttonFinal').addEventListener('click', handleButton);
        }
        
        function showInfoMessage(text) {
            const modal = document.getElementById('infoMessage');
            const messageText = document.getElementById('infoText');
            
            messageText.textContent = text;
            modal.classList.add('show');
            
            setTimeout(() => {
                modal.classList.remove('show');
            }, 4000);
        }

        function createCelebrationParticles() {
            for (let i = 0; i < 50; i++) {
                setTimeout(() => {
                    createParticle();
                }, i * 50);
            }
        }

        function createFinalCelebration() {
            for (let i = 0; i < 200; i++) {
                setTimeout(() => {
                    createParticle();
                }, i * 20);
            }
        }

        function createParticle() {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 3 + 's';
            particle.style.background = `hsl(${Math.random() * 60 + 30}, 100%, 50%)`;
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 4000);
        }

        // GSAP animations
        gsap.from('.main-title', {
            duration: 2,
            y: -100,
            opacity: 0,
            ease: 'bounce.out'
        });
        
        gsap.from('.control-panel', {
            duration: 1,
            y: 50,
            opacity: 0,
            delay: 0.5,
            ease: 'power2.out'
        });
        
        gsap.from('.countdown-section', {
            duration: 1,
            scale: 0.8,
            opacity: 0,
            delay: 1,
            ease: 'back.out'
        });
