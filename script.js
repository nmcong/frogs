document.addEventListener("DOMContentLoaded", () => {
  // =================================================================
  // TAB FUNCTIONALITY
  // =================================================================
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.getAttribute("data-tab");

      // Remove active class from all tabs and panes
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabPanes.forEach((pane) => pane.classList.remove("active"));

      // Add active class to clicked tab and corresponding pane
      button.classList.add("active");
      const targetPane = document.getElementById(targetTab);
      if (targetPane) {
        targetPane.classList.add("active");
      }
    });
  });

  // =================================================================
  // PHẦN 1: KHAI BÁO BIẾN VÀ LẤY CÁC PHẦN TỬ HTML
  // =================================================================
  let grid = [];
  let isMouseDown = false;
  let isRunning = false;
  let DESTINATION = null;
  let gridSize = { rows: 20, cols: 20 };
  let FROG1_START = { row: gridSize.rows - 1, col: 0 };
  let FROG2_START = { row: 0, col: gridSize.cols - 1 };
  let nextStepResolve = null;
  let lastFoundPath = [];
  let currentReplayStep = 0;
  let replayIntervalId = null;
  let isReplayPlaying = false;

  const gridContainer = document.getElementById("grid-container");
  const statusDiv = document.getElementById("status");
  const startBtn = document.getElementById("start-btn");
  const randomBtn = document.getElementById("random-btn");
  const resetBtn = document.getElementById("reset-btn");
  const helpBtn = document.getElementById("help-btn");
  const stepBtn = document.getElementById("step-btn");
  const nextStepBtn = document.getElementById("next-step-btn");
  const stopBtn = document.getElementById("stop-btn");
  const replayBtn = document.getElementById("replay-btn");
  const replayControls = document.getElementById("replay-controls");
  const stepBackBtn = document.getElementById("step-back-btn");
  const playPauseBtn = document.getElementById("play-pause-btn");
  const stepForwardBtn = document.getElementById("step-forward-btn");
  const exitReplayBtn = document.getElementById("exit-replay-btn");
  const progressSlider = document.getElementById("progress-slider");
  const currentStepSpan = document.getElementById("current-step");
  const totalStepsSpan = document.getElementById("total-steps");
  const rowsInput = document.getElementById("rows-input");
  const colsInput = document.getElementById("cols-input");
  const resizeBtn = document.getElementById("resize-btn");
  const mapInput = document.getElementById("map-input");
  const renderMapBtn = document.getElementById("render-map-btn");
  const exportMapBtn = document.getElementById("export-map-btn");
  const generateMazeBtn = document.getElementById("generate-maze-btn");
  const clearWallsBtn = document.getElementById("clear-walls-btn");
  const algoInput = document.getElementById("algo-input");

  // =================================================================
  // PHẦN 2: CÁC HÀM CHỨC NĂNG
  // =================================================================

  function waitForNextStep() {
    return new Promise((resolve) => {
      nextStepResolve = resolve;
    });
  }

  async function executeUserAlgorithm(isStepping = false) {
    if (isRunning) return;
    isRunning = true;
    statusDiv.textContent = "Algorithm is running...";

    replayBtn.classList.add("hidden");
    lastFoundPath = [];

    startBtn.disabled = true;
    stepBtn.disabled = true;
    randomBtn.disabled = true;
    resetBtn.disabled = true;
    stopBtn.classList.remove("hidden");
    if (isStepping) {
      nextStepBtn.classList.remove("hidden");
    }

    resetVisualization();

    const userCode = algoInput.value;
    const api = {
      gridSize,
      FROG1_START,
      FROG2_START,
      DESTINATION,
      isValid: (row, col) => {
        const cell = getCell(row, col);
        return (
          row >= 0 &&
          row < gridSize.rows &&
          col >= 0 &&
          col < gridSize.cols &&
          !!cell &&
          !cell.classList.contains("wall")
        );
      },
      visualize: async (type, row, col, frogNumber) => {
        if (!isRunning) throw new Error("Algorithm stopped by user.");
        const cell = getCell(row, col);
        if (
          !cell ||
          cell.classList.contains("frog1") ||
          cell.classList.contains("frog2")
        )
          return;

        // Clear previous state classes
        cell.classList.remove(
          "visited",
          "current",
          "exploring",
          "frontier",
          "path",
          "visited1",
          "visited2",
        );

        switch (type) {
          case "visited":
            cell.classList.add("visited");
            break;
          case "current":
            cell.classList.add("current");
            break;
          case "exploring":
            cell.classList.add("exploring");
            break;
          case "frontier":
            cell.classList.add("frontier");
            break;
          case "path":
            cell.classList.add("path");
            break;
        }

        if (!isStepping) await sleep(type === "current" ? 100 : 20);
      },
      step: async () => {
        if (!isRunning) throw new Error("Algorithm stopped by user.");
        if (isStepping) {
          await waitForNextStep();
        }
      },
    };

    try {
      const userAlgorithm = new Function(
        "api",
        `return (async (api) => { ${userCode} })(api)`,
      );
      const result = await userAlgorithm(api);
      if (isRunning && result && result.path) {
        statusDiv.textContent = `Success! Shortest path: ${result.distance} steps`;
        lastFoundPath = result.path;
        replayBtn.classList.remove("hidden");
        await visualizePath(result.path);
      } else if (isRunning) {
        statusDiv.textContent =
          "Algorithm returned no result or path not found.";
      }
    } catch (error) {
      if (error.message !== "Algorithm stopped by user.") {
        console.error("Error in user's algorithm:", error);
        statusDiv.textContent = `Syntax or Logic Error: ${error.message}`;
      }
    } finally {
      isRunning = false;
      startBtn.disabled = false;
      stepBtn.disabled = false;
      randomBtn.disabled = false;
      resetBtn.disabled = false;
      nextStepBtn.classList.add("hidden");
      stopBtn.classList.add("hidden");
      nextStepResolve = null;
    }
  }

  function addEventListeners() {
    gridContainer.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      if (isRunning) return;
      isMouseDown = true;
      toggleWall(e.target);
    });
    gridContainer.addEventListener("mouseover", (e) => {
      if (isRunning || !isMouseDown) return;
      toggleWall(e.target);
    });
    document.addEventListener("mouseup", () => {
      isMouseDown = false;
    });
    gridContainer.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      if (isRunning) return;
      const target = e.target;
      if (
        !(target instanceof HTMLElement) ||
        !target.classList.contains("cell")
      )
        return;
      const cell = target;
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);
      if (
        cell.classList.contains("wall") ||
        cell.classList.contains("frog1") ||
        cell.classList.contains("frog2")
      )
        return;
      if (DESTINATION) {
        const oldDestCell = getCell(DESTINATION.row, DESTINATION.col);
        if (oldDestCell) oldDestCell.style.backgroundColor = "";
      }
      DESTINATION = { row, col };
      cell.style.backgroundColor = "gold";
    });

    startBtn.onclick = () => executeUserAlgorithm(false);
    stepBtn.onclick = () => executeUserAlgorithm(true);
    nextStepBtn.onclick = () => {
      if (nextStepResolve) {
        nextStepResolve();
        nextStepResolve = null;
      }
    };

    stopBtn.onclick = () => {
      isRunning = false;
      if (nextStepResolve) {
        nextStepResolve();
        nextStepResolve = null;
      }
      statusDiv.textContent = "Status: Stopped by user.";
      startBtn.disabled = false;
      stepBtn.disabled = false;
      randomBtn.disabled = false;
      resetBtn.disabled = false;
      nextStepBtn.classList.add("hidden");
      stopBtn.classList.add("hidden");
    };

    replayBtn.onclick = () => {
      if (lastFoundPath.length === 0) return;

      currentReplayStep = 0;
      replayControls.classList.remove("hidden");
      replayBtn.classList.add("hidden");

      updateReplayUI();
      showReplayStep(currentReplayStep);
    };

    // Step-by-step replay controls
    stepBackBtn.onclick = () => {
      if (currentReplayStep > 0) {
        currentReplayStep--;
        updateReplayUI();
        showReplayStep(currentReplayStep);
      }
    };

    stepForwardBtn.onclick = () => {
      if (currentReplayStep < lastFoundPath.length - 1) {
        currentReplayStep++;
        updateReplayUI();
        showReplayStep(currentReplayStep);
      }
    };

    playPauseBtn.onclick = () => {
      if (isReplayPlaying) {
        pauseReplay();
      } else {
        playReplay();
      }
    };

    progressSlider.oninput = (e) => {
      const newStep = Math.floor(
        (e.target.value / 100) * (lastFoundPath.length - 1),
      );
      currentReplayStep = newStep;
      updateReplayUI();
      showReplayStep(currentReplayStep);
    };

    exitReplayBtn.onclick = () => {
      stopReplay();
      resetVisualization();
      statusDiv.textContent = "Ready";
    };

    randomBtn.onclick = randomizeWalls;
    resetBtn.onclick = createGrid;
    resizeBtn.onclick = updateGridSize;
    renderMapBtn.onclick = renderMapFromText;
    exportMapBtn.onclick = exportCurrentMap;
    generateMazeBtn.onclick = generateMaze;
    clearWallsBtn.onclick = clearAllWalls;
    helpBtn.onclick = showHelp;

    document.addEventListener("keydown", (e) => {
      const activeElement = document.activeElement;
      if (
        activeElement?.tagName === "TEXTAREA" ||
        activeElement?.tagName === "INPUT"
      ) {
        return;
      }
      if (e.key === "Escape" && isRunning) {
        stopBtn.click();
      }
      switch (e.key.toLowerCase()) {
        case "enter":
          e.preventDefault();
          if (e.shiftKey) {
            stepBtn.click();
          } else {
            startBtn.click();
          }
          break;
        case " ":
          e.preventDefault();
          if (!nextStepBtn.classList.contains("hidden")) {
            nextStepBtn.click();
          }
          break;
        case "r":
          e.preventDefault();
          resetBtn.click();
          break;
        case "w":
          e.preventDefault();
          randomBtn.click();
          break;
        case "h":
          e.preventDefault();
          helpBtn.click();
          break;
        case "arrowleft":
          e.preventDefault();
          if (!replayControls.classList.contains("hidden")) {
            stepBackBtn.click();
          }
          break;
        case "arrowright":
          e.preventDefault();
          if (!replayControls.classList.contains("hidden")) {
            stepForwardBtn.click();
          }
          break;
        case "p":
          e.preventDefault();
          if (!replayControls.classList.contains("hidden")) {
            playPauseBtn.click();
          }
          break;
      }
    });
  }

  function updateGridSize() {
    const newRows = parseInt(rowsInput.value);
    const newCols = parseInt(colsInput.value);
    if (
      isNaN(newRows) ||
      isNaN(newCols) ||
      newRows < 5 ||
      newCols < 5 ||
      newRows > 50 ||
      newCols > 50
    ) {
      alert("Invalid size. Rows and Cols must be between 5 and 50.");
      return;
    }
    gridSize = { rows: newRows, cols: newCols };
    FROG1_START = { row: gridSize.rows - 1, col: 0 };
    FROG2_START = { row: 0, col: gridSize.cols - 1 };
    createGrid();
    mapInput.value = "";
  }

  function showHelp() {
    const helpText = `
Welcome to the Algorithm Visualizer!

To write your own algorithm, follow these rules:

1.  **API Object**: Your function will receive an object named 'api' containing necessary tools:
    * 'api.gridSize': {rows, cols} - The current size of the grid.
    * 'api.FROG1_START', 'api.FROG2_START', 'api.DESTINATION': {row, col} - Coordinates. Destination is null if not set.
    * 'api.isValid(row, col)': A function that returns true if the cell is valid (not a wall, within bounds).
    * 'api.visualize(type, row, col, frogNum)': An async function to visualize cell states:
      - 'visited': Mark cell as visited (purple)
      - 'current': Mark cell as currently being processed (yellow/gold)
      - 'exploring': Mark cell as being explored (red)
      - 'frontier': Mark cell as in frontier/queue (blue)
      - 'path': Mark cell as part of final path (green)
    * 'api.step()': An async function that pauses execution in step-by-step mode.

2.  **Return Value**: Your algorithm must return an object with the structure:
    { 
      distance: <shortest path number>, 
      path: [[r1, c1, r2, c2], ...] 
    }
    Where 'path' is an array logging each step for both frogs.

Below is the sample code for the BFS algorithm:
--------------------------------------------------
        `;
    const sampleCode = algoInput.value;
    alert(helpText + sampleCode);
  }

  function createGrid() {
    gridContainer.innerHTML = "";
    grid = [];
    gridContainer.style.gridTemplateColumns = `repeat(${gridSize.cols}, 1fr)`;
    for (let row = 0; row < gridSize.rows; row++) {
      grid[row] = [];
      for (let col = 0; col < gridSize.cols; col++) {
        const cell = document.createElement("div");
        cell.classList.add("cell", "empty");
        cell.dataset.row = String(row);
        cell.dataset.col = String(col);
        gridContainer.appendChild(cell);
        grid[row][col] = cell;
      }
    }
    resetGridState();
  }

  function resetGridState() {
    isRunning = false;
    for (let row = 0; row < gridSize.rows; row++) {
      for (let col = 0; col < gridSize.cols; col++) {
        const cell = getCell(row, col);
        if (cell) {
          cell.className = "cell empty";
          cell.style.backgroundColor = "";
        }
      }
    }
    if (DESTINATION) {
      const destCell = getCell(DESTINATION.row, DESTINATION.col);
      if (destCell) destCell.style.backgroundColor = "";
    }
    DESTINATION = null;
    replayBtn.classList.add("hidden");
    replayControls.classList.add("hidden");
    stopReplay();
    lastFoundPath = [];
    const frog1Cell = getCell(FROG1_START.row, FROG1_START.col);
    const frog2Cell = getCell(FROG2_START.row, FROG2_START.col);
    if (frog1Cell) frog1Cell.classList.add("frog1");
    if (frog2Cell) frog2Cell.classList.add("frog2");
    statusDiv.textContent = "Status: Ready!";
  }

  function renderMapFromText() {
    if (isRunning) return;
    const text = mapInput.value.trim();
    if (!text) {
      alert("Please enter a map into the textbox.");
      return;
    }
    const lines = text.split("\n");
    const newRows = lines.length;
    const newCols = lines.reduce((max, line) => Math.max(max, line.length), 0);
    rowsInput.value = String(newRows);
    colsInput.value = String(newCols);
    updateGridSize();
    DESTINATION = null;
    for (let r = 0; r < newRows; r++) {
      for (let c = 0; c < newCols; c++) {
        const char = lines[r][c];
        const cell = getCell(r, c);
        if (!cell) continue;
        cell.className = "cell empty";
        cell.style.backgroundColor = "";
        if (char === "#") {
          cell.classList.add("wall");
        } else if (char === "O") {
          DESTINATION = { row: r, col: c };
          cell.style.backgroundColor = "gold";
        }
      }
    }
    const frog1Cell = getCell(FROG1_START.row, FROG1_START.col);
    if (frog1Cell?.classList.contains("wall")) {
      alert("Warning: Frog 1's start position is on a wall!");
      frog1Cell.classList.remove("wall");
    }
    frog1Cell?.classList.add("frog1");
    const frog2Cell = getCell(FROG2_START.row, FROG2_START.col);
    if (frog2Cell?.classList.contains("wall")) {
      alert("Warning: Frog 2's start position is on a wall!");
      frog2Cell.classList.remove("wall");
    }
    frog2Cell?.classList.add("frog2");
  }

  function getCell(row, col) {
    return grid[row]?.[col] || null;
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function resetVisualization() {
    for (let r = 0; r < gridSize.rows; r++) {
      for (let c = 0; c < gridSize.cols; c++) {
        const cell = getCell(r, c);
        cell?.classList.remove(
          "visited1",
          "visited2",
          "path1",
          "path2",
          "visited",
          "current",
          "exploring",
          "frontier",
          "path",
        );
      }
    }
  }

  async function visualizePath(path) {
    resetVisualization();
    for (let r = 0; r < gridSize.rows; r++) {
      for (let c = 0; c < gridSize.cols; c++) {
        const cell = getCell(r, c);
        if (cell) {
          cell.classList.remove("frog1", "frog2");
        }
      }
    }
    for (const state of path) {
      if (!isRunning && !replayBtn.disabled) break;
      const [r1, c1, r2, c2] = state;
      const cell1 = getCell(r1, c1);
      const cell2 = getCell(r2, c2);
      if (cell1) {
        cell1.classList.add("path");
        cell1.classList.add("frog1");
      }
      if (cell2) {
        cell2.classList.add("path");
        cell2.classList.add("frog2");
      }
      await sleep(75);
      if (cell1) cell1.classList.remove("frog1");
      if (cell2) cell2.classList.remove("frog2");
    }

    if (isRunning || replayBtn.disabled) {
      const finalState = path[path.length - 1];
      const [finalR1, finalC1] = finalState;
      const finalCell1 = getCell(finalR1, finalC1);
      if (finalCell1) {
        finalCell1.classList.add("frog1");
        finalCell1.classList.add("frog2");
      }
    }
  }

  function toggleWall(target) {
    if (!(target instanceof HTMLElement) || !target.classList.contains("cell"))
      return;
    const cell = target;
    if (
      cell.classList.contains("frog1") ||
      cell.classList.contains("frog2") ||
      cell.style.backgroundColor === "gold"
    )
      return;
    cell.classList.toggle("wall");
    cell.classList.toggle("empty");
  }

  function exportCurrentMap() {
    let mapString = "";
    for (let row = 0; row < gridSize.rows; row++) {
      let line = "";
      for (let col = 0; col < gridSize.cols; col++) {
        const cell = getCell(row, col);
        if (cell.classList.contains("wall")) {
          line += "#";
        } else if (
          DESTINATION &&
          DESTINATION.row === row &&
          DESTINATION.col === col
        ) {
          line += "O";
        } else {
          line += ".";
        }
      }
      mapString += line + "\n";
    }
    mapInput.value = mapString.trim();
    statusDiv.textContent = "Map exported to textarea";
  }

  function generateMaze() {
    if (isRunning) return;

    // Clear existing walls first
    for (let row = 0; row < gridSize.rows; row++) {
      for (let col = 0; col < gridSize.cols; col++) {
        const cell = getCell(row, col);
        cell.classList.remove("wall");
        cell.style.backgroundColor = "";
      }
    }

    // Create maze using recursive backtracking
    const maze = Array(gridSize.rows)
      .fill()
      .map(() => Array(gridSize.cols).fill(1));

    function isValid(r, c) {
      return r >= 0 && r < gridSize.rows && c >= 0 && c < gridSize.cols;
    }

    function carve(r, c) {
      maze[r][c] = 0;

      const directions = [
        [0, 2],
        [2, 0],
        [0, -2],
        [-2, 0],
      ];
      // Randomize directions
      for (let i = directions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [directions[i], directions[j]] = [directions[j], directions[i]];
      }

      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;

        if (isValid(nr, nc) && maze[nr][nc] === 1) {
          maze[r + dr / 2][c + dc / 2] = 0;
          carve(nr, nc);
        }
      }
    }

    // Start carving from (1,1)
    carve(1, 1);

    // Ensure frog positions are accessible
    const FROG1_START = { row: 0, col: 0 };
    const FROG2_START = { row: gridSize.rows - 1, col: gridSize.cols - 1 };
    maze[FROG1_START.row][FROG1_START.col] = 0;
    maze[FROG2_START.row][FROG2_START.col] = 0;

    // Apply maze to grid
    for (let row = 0; row < gridSize.rows; row++) {
      for (let col = 0; col < gridSize.cols; col++) {
        if (maze[row][col] === 1) {
          const cell = getCell(row, col);
          cell.classList.add("wall");
        }
      }
    }

    // Clear any existing destination
    if (DESTINATION) {
      const oldDestCell = getCell(DESTINATION.row, DESTINATION.col);
      if (oldDestCell) oldDestCell.style.backgroundColor = "";
      DESTINATION = null;
    }

    statusDiv.textContent = "Maze generated successfully";
  }

  function clearAllWalls() {
    if (isRunning) return;

    for (let row = 0; row < gridSize.rows; row++) {
      for (let col = 0; col < gridSize.cols; col++) {
        const cell = getCell(row, col);
        cell.classList.remove("wall");
      }
    }
    statusDiv.textContent = "All walls cleared";
  }

  function updateReplayUI() {
    if (lastFoundPath.length === 0) return;

    currentStepSpan.textContent = currentReplayStep;
    totalStepsSpan.textContent = lastFoundPath.length - 1;
    progressSlider.value =
      (currentReplayStep / (lastFoundPath.length - 1)) * 100;

    stepBackBtn.disabled = currentReplayStep === 0;
    stepForwardBtn.disabled = currentReplayStep === lastFoundPath.length - 1;
  }

  function showReplayStep(stepIndex) {
    if (stepIndex >= lastFoundPath.length) return;

    resetVisualization();
    for (let r = 0; r < gridSize.rows; r++) {
      for (let c = 0; c < gridSize.cols; c++) {
        const cell = getCell(r, c);
        if (cell) {
          cell.classList.remove("frog1", "frog2");
        }
      }
    }

    // Show path up to current step
    for (let i = 0; i <= stepIndex; i++) {
      const [r1, c1, r2, c2] = lastFoundPath[i];
      const cell1 = getCell(r1, c1);
      const cell2 = getCell(r2, c2);

      if (cell1) cell1.classList.add("path");
      if (cell2) cell2.classList.add("path");
    }

    // Show current position
    if (stepIndex < lastFoundPath.length) {
      const [r1, c1, r2, c2] = lastFoundPath[stepIndex];
      const cell1 = getCell(r1, c1);
      const cell2 = getCell(r2, c2);

      if (cell1) cell1.classList.add("frog1");
      if (cell2) cell2.classList.add("frog2");
    }

    statusDiv.textContent = `Replay step ${stepIndex} of ${lastFoundPath.length - 1}`;
  }

  function playReplay() {
    if (isReplayPlaying) return;

    isReplayPlaying = true;
    playPauseBtn.textContent = "⏸️";

    replayIntervalId = setInterval(() => {
      if (currentReplayStep < lastFoundPath.length - 1) {
        currentReplayStep++;
        updateReplayUI();
        showReplayStep(currentReplayStep);
      } else {
        pauseReplay();
      }
    }, 200);
  }

  function pauseReplay() {
    if (!isReplayPlaying) return;

    isReplayPlaying = false;
    playPauseBtn.textContent = "▶️";

    if (replayIntervalId) {
      clearInterval(replayIntervalId);
      replayIntervalId = null;
    }
  }

  function stopReplay() {
    pauseReplay();
    replayControls.classList.add("hidden");
    replayBtn.classList.remove("hidden");
    currentReplayStep = 0;
  }

  function randomizeWalls() {
    if (isRunning) return;
    resetGridState();
    let destRow, destCol;
    do {
      destRow = Math.floor(Math.random() * gridSize.rows);
      destCol = Math.floor(Math.random() * gridSize.cols);
    } while (
      (destRow === FROG1_START.row && destCol === FROG1_START.col) ||
      (destRow === FROG2_START.row && destCol === FROG2_START.col)
    );
    DESTINATION = { row: destRow, col: destCol };
    const destCell = getCell(destRow, destCol);
    if (destCell) {
      destCell.style.backgroundColor = "gold";
    }
    for (let row = 0; row < gridSize.rows; row++) {
      for (let col = 0; col < gridSize.cols; col++) {
        const isFrog1Start = row === FROG1_START.row && col === FROG1_START.col;
        const isFrog2Start = row === FROG2_START.row && col === FROG2_START.col;
        const isDestination =
          row === DESTINATION.row && col === DESTINATION.col;
        if (isFrog1Start || isFrog2Start || isDestination) {
          continue;
        }
        if (Math.random() < 0.25) {
          const cell = getCell(row, col);
          if (cell) {
            cell.classList.remove("empty");
            cell.classList.add("wall");
          }
        }
      }
    }
  }

  // =================================================================
  // PHẦN 3: KHỞI CHẠY ỨNG DỤNG
  // =================================================================

  if (algoInput) {
    algoInput.value = `// Sample algorithm to find the destination 'O'
const { gridSize, FROG1_START, FROG2_START, DESTINATION, isValid, visualize, step } = api;

if (!DESTINATION) {
    alert("Please define a destination 'O' by right-clicking or using the randomizer.");
    return null;
}

const queue = [[FROG1_START.row, FROG1_START.col, FROG2_START.row, FROG2_START.col, 0]];
const visited = new Set();
const parent = new Map();
const startStateKey = \`\${FROG1_START.row},\${FROG1_START.col},\${FROG2_START.row},\${FROG2_START.col}\`;
visited.add(startStateKey);
parent.set(startStateKey, null);
const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

while (queue.length > 0) {
    const [r1, c1, r2, c2, dist] = queue.shift();
    await visualize('current', r1, c1, 1);
    await visualize('current', r2, c2, 2);
    await step();
    await visualize('visited', r1, c1, 1);
    await visualize('visited', r2, c2, 2);
    if (r1 === DESTINATION.row && c1 === DESTINATION.col && r2 === DESTINATION.row && c2 === DESTINATION.col) {
        let path = []; let currKey = \`\${r1},\${c1},\${r2},\${c2}\`;
        while (currKey) {
            path.push(currKey.split(',').map(Number));
            const parentKey = parent.get(currKey);
            currKey = parentKey ? parentKey : null;
        }
        return { distance: dist, path: path.reverse() };
    }
    for (const [dr1, dc1] of directions) {
        const nr1 = r1 + dr1; const nc1 = c1 + dc1; if (!isValid(nr1, nc1)) continue;
        for (const [dr2, dc2] of directions) {
            const nr2 = r2 + dr2; const nc2 = c2 + dc2; if (!isValid(nr2, nc2)) continue;
            const stateKey = \`\${nr1},\${nc1},\${nr2},\${nc2}\`;
            if (!visited.has(stateKey)) {
                visited.add(stateKey);
                parent.set(stateKey, \`\${r1},\${c1},\${r2},\${c2}\`);
                queue.push([nr1, nc1, nr2, nc2, dist + 1]);
                await visualize('frontier', nr1, nc1, 1);
                await visualize('frontier', nr2, nc2, 2);
                await step();
            }
        }
    }
}
return null;`;
  }

  addEventListeners();
  createGrid();
});
