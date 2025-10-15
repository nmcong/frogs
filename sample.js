// const { gridSize, FROG1_START, FROG2_START, DESTINATION, isValid, visualize, step } = api;
//
// if (!DESTINATION) {
//     return null;
// }
// const queue = [[FROG1_START.row, FROG1_START.col, FROG2_START.row, FROG2_START.col, 0]];
// const visited = new Set();
// const parent = new Map();
// const startStateKey = `${FROG1_START.row},${FROG1_START.col},${FROG2_START.row},${FROG2_START.col}`;
// visited.add(startStateKey);
// parent.set(startStateKey, null);
// const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
//
// while (queue.length > 0) {
//     const [r1, c1, r2, c2, dist] = queue.shift();
//
//     await visualize('current', r1, c1, 1);
//     await visualize('current', r2, c2, 2);
//
//     for (const [dr1, dc1] of directions) {
//         let nr1 = (r1 === DESTINATION.row && c1 === DESTINATION.col) ? r1 : (r1 + dr1);
//         let nc1 = (r1 === DESTINATION.row && c1 === DESTINATION.col) ? c1 : (c1 + dc1);
//         let nr2 = (r2 === DESTINATION.row && c2 === DESTINATION.col) ? r2 : (r2 + dr1 * -1);
//         let nc2 = (r2 === DESTINATION.row && c2 === DESTINATION.col) ? c2 : (c2 + dc1 * -1);
//
//         if(!isValid(nr1, nc1)) {
//             nr1 = r1;
//             nc1 = c1;
//         }
//         if(!isValid(nr2, nc2)) {
//             nr2 = r2;
//             nc2 = c2;
//         }
//         if (nr1 === DESTINATION.row && nc1 === DESTINATION.col && nr2 === DESTINATION.row && nc2 === DESTINATION.col) {
//             const stateKey = `${nr1},${nc1},${nr2},${nc2}`;
//             parent.set(stateKey, `${r1},${c1},${r2},${c2}`);
//             let path = [];
//             let currKey = stateKey;
//             while (currKey) {
//                 path.push(currKey.split(',').map(Number));
//                 const parentKey = parent.get(currKey);
//                 currKey = parentKey ? parentKey : null;
//             }
//             return { distance: dist, path: path.reverse() };
//         }
//         const stateKey = `${nr1},${nc1},${nr2},${nc2}`;
//         if (!visited.has(stateKey)) {
//             visited.add(stateKey);
//             parent.set(stateKey, `${r1},${c1},${r2},${c2}`);
//             queue.push([nr1, nc1, nr2, nc2, dist + 1]);
//             await visualize('frontier', nr1, nc1, 1);
//             await visualize('frontier', nr2, nc2, 2);
//             await step();
//         }
//     }
//     await visualize('visited', r1, c1, 1);
//     await visualize('visited', r2, c2, 2);
// }
// return null;
