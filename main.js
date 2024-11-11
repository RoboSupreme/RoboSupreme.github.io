// main.js

document.addEventListener('DOMContentLoaded', () => {
  init();
});

function init() {
  const gameContainer = document.getElementById('game-container');
  gameContainer.innerHTML = '';

  // Create buttons and assign to renderer
  renderer = {}; // Reset renderer
  renderer.startGameButton = createButton('Start Game', startGame);
  renderer.infoButton = createButton('Info', openInfoDialog);

  gameContainer.appendChild(createElement('div', '', [
      createElement('h1', '', 'Satirical Footballer Game'),
      createElement('p', 'gold-text', `Goal: win Ballon d'Ors at all cause, even if it means bribing officials!`),
      createElement('p', '', 'Fan popularity and officials\' relationship is more important than skill in this game.'),
      renderer.startGameButton,
      ' ',
      renderer.infoButton
  ]));

  // Initialize hover text
  const hoverText = createElement('div', 'hover-text hidden', '');
  document.body.appendChild(hoverText);

  document.addEventListener('mousemove', e => {
      if (e.target.dataset.title) {
          hoverText.textContent = e.target.dataset.title;
          hoverText.classList.remove('hidden');
          hoverText.style.left = e.clientX + 'px';
          hoverText.style.top = e.clientY + 'px';
      } else {
          hoverText.classList.add('hidden');
      }
  });
}

let gameState;
let renderer = {};

function startGame() {
  closeInfoDialog();
  
  // Prevent starting the game multiple times
  if (gameState && !gameState.gameOver) {
      return;
  }

  // Hide or remove the Start Game button
  if (renderer.startGameButton) {
      renderer.startGameButton.style.display = 'none'; // Hide the button
  }

  gameState = {
      semester: 1,
      age: 28,
      ageFactor: 50,
      timeUnits: 0,
      fanPopularity: 5,
      officialsPopularity: 5,
      preparationPercentage: 40,
      restTime: 0,
      marketingOpportunities: 0,
      goals: 0,
      assists: 0,
      totalGoals: 0,
      totalAssists: 0,
      goalsThisYear: 0, // Added to track yearly goals
      assistsThisYear: 0, // Added to track yearly assists
      celebrationOccurred: false,
      competitions: {
          league: { baseWinChance: 0, finalWinChance: 0, won: false, bribed: false },
          copaDelRey: { baseWinChance: 0, finalWinChance: 0, won: false, eliminated: false, bribed: false },
          championsLeague: { baseWinChance: 0, finalWinChance: 0, won: false, eliminated: false, bribed: false },
          copaAmerica: { baseWinChance: 0, finalWinChance: 0, won: false, bribed: false },
          worldCup: { baseWinChance: 0, finalWinChance: 0, won: false, bribed: false },
      },
      previousBribes: [],
      ballonDorScore: 0,
      ballonDorsWon: 0,
      puskasWon: 0,
      totalLeaguePoints: 0,
      gameOver: false,
  };
  playGame();
}

async function playGame() {
  while (!gameState.gameOver) {
      await playSemester();
  }
}

async function playSemester() {
  // Initialize semester
  gameState.timeUnits = getRandomInt(10, 10);
  // Adjust time units if covering up a scandal
  if (gameState.timeUnitsNextSemester) {
    gameState.timeUnits += gameState.timeUnitsNextSemester; // Note: timeUnitsNextSemester is negative
    gameState.timeUnitsNextSemester = 0; // Reset for the next semester
  }
  gameState.marketingOpportunities = getRandomInt(2, 4);
  gameState.preparationPercentage = 40;
  gameState.restTime = 0;
  gameState.celebrationOccurred = false;
  gameState.goals = 0;
  gameState.assists = 0;
  gameState.fanPopularity += getRandomInt(-1, 1);
  gameState.officialsPopularity += getRandomInt(-1, 1);

  // Free Choose State
  await timeAllocationPhase();

  // Event State
  await specialEventsPhase();

  if (gameState.semester === 1) {
      // Calculations
      calculateAgeFactor();
      calculateGoalsAndAssists();
      calculateWinningChances();
      // Elimination + League Points Stage
      await simulateCompetitionsFirstSemester(['copaDelRey', 'championsLeague']);
      // Update fan popularity based on eliminations
      updateFanPopularityAfterCompetitionsFirstSemester(['copaDelRey', 'championsLeague']);
      calculateLeaguePoints();
      // Show competition results
      await showCompetitionResults(['copaDelRey', 'championsLeague']);
      // Personal Achievement Stage
      await showPersonalAchievements();
  } else {
      // Bribery Opportunities
      await handleBriberyOpportunities();
      // Calculations
      calculateAgeFactor();
      calculateGoalsAndAssists();
      calculateWinningChances();
      // Simulate Competitions
      await simulateCompetitionsSecondSemester(['copaDelRey', 'championsLeague', 'copaAmerica', 'worldCup']);
      // Update fan popularity based on competition results
      updateFanPopularityAfterCompetitionsSecondSemester(['league', 'copaDelRey', 'championsLeague']);
      calculateLeaguePoints();
      // Trophies Stage
      await showTrophiesWon(['league', 'copaDelRey', 'championsLeague', 'copaAmerica', 'worldCup']);
      // Personal Achievement Stage
      await showYearlyAchievements(); // Show yearly goals and assists
      // Personal Trophy Stage
      await showPersonalTrophies();
      // Reset yearly stats
      gameState.goalsThisYear = 0;
      gameState.assistsThisYear = 0;
  }

  // Check Game Over Conditions
  if (gameState.officialsPopularity >= 50) {
    gameState.gameOver = true;
    showSpecialEnding();
    return;
  }
  if (gameState.fanPopularity <= 0) {
      gameState.gameOver = true;
      showEndGame('Fan popularity dropped to zero. You have been kicked out of the club.');
      return;
  }
  if (gameState.officialsPopularity <= 0) {
      gameState.gameOver = true;
      showEndGame("Officials' popularity dropped to zero. You have been eliminated from competitions.");
      return;
  }

  // Prepare for Next Semester
  if (gameState.semester === 2) {
      gameState.semester = 1;
      gameState.age += 1;
      if (gameState.age >= 35) {
          gameState.gameOver = true;
          showEndGame('You have retired from professional football.');
          return;
      }
      // Reset league points every year
      gameState.totalLeaguePoints = 0;

      gameState.previousBribes = [];
      // Also reset bribed status in competitions
      for (const comp in gameState.competitions) {
          gameState.competitions[comp].bribed = false;
      }
  } else {
      gameState.semester += 1;
  }
}

function waitForPlayerChoice() {
  return new Promise(resolve => {
    renderer.choiceResolve = resolve;
  });
}

async function timeAllocationPhase() {
  renderStats();
  updateStateIndicator('Free Choose State');
  const gameContainer = document.getElementById('game-container');

  // Create free choose container if not exists
  if (!renderer.freeChooseContainer) {
    renderer.freeChooseContainer = createElement('div', '', '');
    gameContainer.appendChild(renderer.freeChooseContainer);
  }

  while (gameState.timeUnits > -1) {
    // Clear the free choose container
    renderer.freeChooseContainer.innerHTML = '';

    renderStats();

    // Create message
    const message = createElement('div', 'message', `You have ${gameState.timeUnits} time units left. Choose an activity:`);
    renderer.freeChooseContainer.appendChild(message);

    // Create choice elements with descriptions
    const choices = createElement('div', '', '');

    const activities = [
      {
        name: 'Training',
        action: 'train',
        description: ` You are now ${gameState.preparationPercentage.toFixed(2)}% prepared.`,
        disabled: false, // Always enabled
      },
      {
        name: 'Marketing <-- choose this',
        action: 'marketing',
        description: ` You have ${gameState.marketingOpportunities} marketing opportunities left.`,
        disabled: gameState.marketingOpportunities <= 0,
      },
      {
        name: 'Official Relationships <-- choose this',
        action: 'relationships',
        description: ` Officials' popularity is ${gameState.officialsPopularity}.`,
        disabled: false, // Always enabled
      },
      {
        name: 'Resting',
        action: 'rest',
        description: ` Don't forget to rest!`,
        disabled: false, // Always enabled
      },
    ];

    activities.forEach((activity) => {
      const button = createButton(activity.name, () => {
        allocateTimeUnit(activity.action);
      });
      button.disabled = activity.disabled; // Disable the button if necessary

      const description = createElement('span', 'description', activity.description);
      const container = createElement('div', 'activity-option', [button, description]);
      choices.appendChild(container);
    });

    renderer.freeChooseContainer.appendChild(choices);

    // If there's an existing response, append it
    if (renderer.responseElement) {
      renderer.freeChooseContainer.appendChild(renderer.responseElement);
    }

    // Wait for player choice
    await waitForPlayerChoice();
  }

  showNotification('No time allocation left. Proceeding to event phase.');

  // Wait for OK to proceed
  await waitForOK();

  // Remove the freeChooseContainer
  if (renderer.freeChooseContainer) {
    gameContainer.removeChild(renderer.freeChooseContainer);
    renderer.freeChooseContainer = null;
  }

  // Remove the responseElement
  if (renderer.responseElement) {
    gameContainer.removeChild(renderer.responseElement);
    renderer.responseElement = null;
  }

  // Remove the notification after acknowledgment
  if (renderer.notificationElement) {
    gameContainer.removeChild(renderer.notificationElement);
    renderer.notificationElement = null;
  }
}

function allocateTimeUnit(activity) {
  let response = '';
  switch (activity) {
    case 'train':
      const prepIncrease = getRandomFloat(10, 10);
      gameState.preparationPercentage += prepIncrease;
      gameState.timeUnits -= 1;
      response = `You trained and increased preparation by ${prepIncrease.toFixed(2)}%. But remember, all the training in the world won’t beat a well-timed bribe.`;
      break;
    case 'rest':
      gameState.restTime += 1;
      gameState.timeUnits -= 1;
      response = 'You took a break to rest. Hopefully, your rivals didn’t gain too many new fans while you napped!';
      break;
    case 'marketing':
      if (gameState.marketingOpportunities > 0) {
        const success = Math.random() < 0.7;
        if (success) {
          gameState.fanPopularity += 1;
          response = 'Marketing was a hit! Fan popularity went up by 1. Nothing like some brand deals to make up for skill!';
        } else {
          response = 'Marketing flopped. Perhaps controversy would work better than charm?';
          // Now, possibly lose fan popularity
          if (Math.random() < 0.1) {
            gameState.fanPopularity -= 1;
            response += ' Fan popularity decreased by 1 due to the failed campaign.';
      }
        }
        gameState.marketingOpportunities -= 1;
        gameState.timeUnits -= 1; // Only deduct time when a marketing opportunity is used
      } else {
        response = 'No marketing opportunities left. Fame can be fickle!';
      }
      break;      
      case 'relationships':
        const popularityChange = Math.random() < 0.3 ? 0 : 1; // 50% chance to gain officials' popularity
        if (popularityChange) {
          gameState.officialsPopularity += popularityChange;
          response = "You mingled with officials. Popularity with them increased by 1. You’re mastering the 'real' game here!";
        } else {
          response = "Your attempt to mingle with officials didn't go as planned. No increase in popularity.";
          // Possible decrease in popularity
          if (Math.random() < 0.2) {
            gameState.officialsPopularity -= 1;
            response += ' Officials\' popularity decreased by 1 due to a faux pas.';
          }
        }
        gameState.timeUnits -= 1;
        break;      
  }
  renderer.lastAction = response;

  // Remove previous responseElement if any
  if (renderer.responseElement) {
    renderer.freeChooseContainer.removeChild(renderer.responseElement);
    renderer.responseElement = null;
  }
  renderResponse(renderer.lastAction); // Show response after action

  if (renderer.choiceResolve) {
    renderer.choiceResolve();
    renderer.choiceResolve = null;
  }
}

function renderResponse(response) {
  const gameContainer = document.getElementById('game-container');
  if (renderer.responseElement && renderer.responseElement.parentNode === gameContainer) {
      gameContainer.removeChild(renderer.responseElement);
  }
  renderer.responseElement = createElement('div', 'response', response);
  gameContainer.appendChild(renderer.responseElement);
}

async function specialEventsPhase() {
  // Special events occur one after another
  await handleInjuryRisk();
  await conductInterview();
  await handleCelebrationEvent();
  await handleScandalEvent(); // Added scandal event
}

async function handleInjuryRisk() {
  updateStateIndicator('Injury Risk');
  if (renderer.responseElement) {
    const gameContainer = document.getElementById('game-container');
    gameContainer.removeChild(renderer.responseElement);
    renderer.responseElement = null;
  }

  const injuryRisk = 60 / (100 + (30 * gameState.restTime));
  const injuryRoll = Math.random();
  if (injuryRoll < injuryRisk) {
    const severityRoll = Math.random();
    if (severityRoll < 0.5) {
      gameState.preparationPercentage *= 0.7;
      renderResponse('You suffered a minor injury. Preparation dropped by 30%. But hey, fans will still cheer if you look good on camera!');
    } else {
      gameState.preparationPercentage = 0;
      renderResponse('A major injury! Preparation hit rock bottom. Maybe focus on social media appearances instead?');
    }
  } else {
    renderResponse('No injuries this semester! You’re free to dazzle fans with style over substance.');
  }
  await waitForOK();
}

async function conductInterview() {
  updateStateIndicator('Interview');
  renderStats();
  const gameContainer = document.getElementById('game-container');

  // Remove any existing response
  if (renderer.responseElement) {
      gameContainer.removeChild(renderer.responseElement);
      renderer.responseElement = null;
  }

  renderer.messageElement = createElement('div', 'message', 'An interview is scheduled. Choose your response:');
  gameContainer.appendChild(renderer.messageElement);

  renderer.choicesContainer = createElement('div', '', [
    createButton('Arrogant', () => interviewResponse('arrogant')),
    createButton('Kind', () => interviewResponse('kind')),
    createButton('Neutral', () => interviewResponse('neutral')),
  ]);
  
  renderer.choicesContainer.style.display = 'flex';
  renderer.choicesContainer.style.gap = '10px'; // Sets a 10px gap between items
  
  gameContainer.appendChild(renderer.choicesContainer);

  await waitForPlayerChoice();

  renderResponse(renderer.lastAction);

  // Remove previous choices and message
  gameContainer.removeChild(renderer.messageElement);
  gameContainer.removeChild(renderer.choicesContainer);
  renderer.messageElement = null;
  renderer.choicesContainer = null;

  await waitForOK();
}

function interviewResponse(type) {
  const fanPopBefore = gameState.fanPopularity;
  let change = getRandomInt(1, 3);
  let response = '';
  if (type === 'arrogant') {
    gameState.fanPopularity += change;
    gameState.officialsPopularity -= change;
    if (fanPopBefore > 10) {
      gameState.fanPopularity += 1;
    }
    response = `You chose an arrogant response. Fan popularity increased by ${change}, officials' popularity decreased by ${change}. Arrogance pays off in the world of fame!`;
  } else if (type === 'kind') {
    gameState.fanPopularity -= change;
    gameState.officialsPopularity += change;
    if (fanPopBefore > 10) {
      change -= 1;
      gameState.fanPopularity += 1; // Reduce the decrease by 1
    }
    response = `You chose a kind response. Fan popularity decreased by ${change}, officials' popularity increased by ${change}. Kindness is overrated anyway.`;
  } else {
    if (fanPopBefore > 20) {
      gameState.fanPopularity += 2;
      response = 'You chose a neutral response. Fan popularity increased by 1. Sitting on the fence can sometimes help!';
    } else if (fanPopBefore > 10){
      gameState.fanPopularity;
      response = 'You chose a neutral response. No significant changes. Maybe be more controversial next time?';
    } else {
      gameState.fanPopularity -= 2;
      response = 'You chose a neutral response. No significant changes. Maybe be more controversial next time?';
    }
  }
  renderer.lastAction = response;
  // Resolve the player choice promise
  if (renderer.choiceResolve) {
    renderer.choiceResolve();
    renderer.choiceResolve = null;
  }
}

async function handleCelebrationEvent() {
  updateStateIndicator('Celebration Event');
  const celebrationOccurs = Math.random() < 0.3;

  // Remove any existing response
  if (renderer.responseElement) {
      const gameContainer = document.getElementById('game-container');
      gameContainer.removeChild(renderer.responseElement);
      renderer.responseElement = null;
  }

  if (celebrationOccurs) {
      renderStats();
      const gameContainer = document.getElementById('game-container');

      renderer.messageElement = createElement('div', 'message', 'You scored a stunning goal! Do you want to celebrate?');
      gameContainer.appendChild(renderer.messageElement);

      renderer.choicesContainer = createElement('div', '', [
          createButton('Celebrate', () => celebrationChoice(true)),
          createButton('Do Not Celebrate', () => celebrationChoice(false)),
      ]);
      renderer.choicesContainer.style.display = 'flex';
      renderer.choicesContainer.style.gap = '10px'; // Sets a 10px gap between items
      gameContainer.appendChild(renderer.choicesContainer);

      await waitForPlayerChoice();

      renderResponse(renderer.lastAction);

      // Remove previous choices and message
      gameContainer.removeChild(renderer.messageElement);
      gameContainer.removeChild(renderer.choicesContainer);
      renderer.messageElement = null;
      renderer.choicesContainer = null;
  } else {
      renderResponse('No celebration events occurred this semester.');
  }
  await waitForOK();
}

function celebrationChoice(choice) {
  const fanPopBefore = gameState.fanPopularity;
  let response = '';
  if (choice) {
    gameState.celebrationOccurred = true;
    gameState.fanPopularity += 2;
    gameState.officialsPopularity -= 2;
    if (fanPopBefore > 10) {
      gameState.fanPopularity += 2;
      gameState.officialsPopularity -= 2;
    }
    response = "You celebrated with flair! Fan popularity soared, but officials weren't too thrilled. Fame isn’t free!";
  } else {
    response = 'You chose not to celebrate. Modesty might be your thing, but it won’t win you many fans!';
    if (Math.random() < 0.5) {
      gameState.fanPopularity -= 1;
      response += ' Fan popularity decreased by 1 due to lack of excitement.';
    }
  }
  renderer.lastAction = response;
  if (renderer.choiceResolve) {
    renderer.choiceResolve();
    renderer.choiceResolve = null;
  }
}

async function handleScandalEvent() {
  updateStateIndicator('Scandal Event');

  // 30% chance of scandal occurring
  const scandalOccurs = Math.random() < 0.3;

  // Remove any existing response
  if (renderer.responseElement) {
    const gameContainer = document.getElementById('game-container');
    gameContainer.removeChild(renderer.responseElement);
    renderer.responseElement = null;
  }

  if (scandalOccurs) {
    renderStats();
    const gameContainer = document.getElementById('game-container');

    renderer.messageElement = createElement(
      'div',
      'message',
      'A scandal involving you has surfaced! Do you want to spend 3 time units next semester to cover it up?'
    );
    gameContainer.appendChild(renderer.messageElement);

    renderer.choicesContainer = createElement('div', '', [
      createButton('Cover It Up (Spend 3 Time Units)', () => scandalChoice(true)),
      createButton('Let It Be', () => scandalChoice(false)),
    ]);
    renderer.choicesContainer.style.display = 'flex';
    renderer.choicesContainer.style.gap = '10px';
    gameContainer.appendChild(renderer.choicesContainer);

    await waitForPlayerChoice();

    renderResponse(renderer.lastAction);

    // Remove previous choices and message
    gameContainer.removeChild(renderer.messageElement);
    gameContainer.removeChild(renderer.choicesContainer);
    renderer.messageElement = null;
    renderer.choicesContainer = null;

    await waitForOK();
  } else {
    renderResponse('No scandals occurred this semester. For now, your secrets are safe!');
    await waitForOK();
  }
}

function scandalChoice(choice) {
  if (choice) {
    // Player chooses to cover up the scandal
    gameState.timeUnitsNextSemester = (gameState.timeUnitsNextSemester || 0) - 3;
    renderer.lastAction =
      'You decided to cover up the scandal. It will cost you 3 time units next semester. Time well spent maintaining that pristine image!';
  } else {
    // Player chooses not to cover up the scandal
    let fanDeduction;
    if (gameState.fanPopularity > 30) {
      fanDeduction = 0;
    } else if (gameState.fanPopularity > 20) {
      fanDeduction = 2;
    } else {
      fanDeduction = getRandomInt(2, 5);
    }

    const officialsDeduction = getRandomInt(3, 5);

    gameState.fanPopularity -= fanDeduction;
    gameState.officialsPopularity -= officialsDeduction;

    renderer.lastAction = `You chose not to cover up the scandal. Fan popularity decreased by ${fanDeduction}, officials' popularity decreased by ${officialsDeduction}. Scandals do have a way of tarnishing reputations!`;
  }

  if (renderer.choiceResolve) {
    renderer.choiceResolve();
    renderer.choiceResolve = null;
  }
}

function renderStats() {
  const gameContainer = document.getElementById('game-container');
  if (renderer.stats) {
      gameContainer.removeChild(renderer.stats);
  }
  renderer.stats = createElement('div', 'stats', [
      createElement('div', '', `Time Left: ${gameState.timeUnits}`),
      createElement('div', '', `Semester: ${gameState.semester}`),
      createElement('div', '', `Age: ${gameState.age}`),
      createElement('div', '', `Puskás Awards Won: ${gameState.puskasWon}`),
      createElement('div', 'gold-text', `Ballon d'Ors Won: ${gameState.ballonDorsWon}`),
      createElement('div', '', [
        'Fan Popularity:',
        createProgressBar(gameState.fanPopularity)
      ]),
      createElement('div', '', [
        "Officials' Popularity:",
        createProgressBar(gameState.officialsPopularity)
      ]),
  ]);
  gameContainer.insertBefore(renderer.stats, gameContainer.firstChild);
}

function createProgressBar(value) {
  const progressBar = createElement('div', 'progress-bar', [
    createElement('div', 'progress-bar-fill', '')
  ]);
  const fillElement = progressBar.querySelector('.progress-bar-fill');
  fillElement.style.width = 2 * Math.min(value, 100) + '%';
  return progressBar;
}

function calculateAgeFactor() {
  if (gameState.age < 28) {
      gameState.ageFactor = 50 - ((28 - gameState.age) * 4);
  } else if (gameState.age > 28) {
      gameState.ageFactor = 50 - ((gameState.age - 28) * 5);
  } else {
      gameState.ageFactor = 50;
  }
}

function calculateGoalsAndAssists() {
  const luckFactorGoals = getRandomFloat(0.8, 1.2);
  const luckFactorAssists = getRandomFloat(0.8, 1.2);
  const ageAdjustment = 1 + 0.01 * gameState.ageFactor;
  gameState.goals = (gameState.preparationPercentage / 100) * 30 * luckFactorGoals * ageAdjustment;
  gameState.assists = (gameState.preparationPercentage / 100) * 15 * luckFactorAssists * ageAdjustment;
  gameState.totalGoals += gameState.goals;
  gameState.totalAssists += gameState.assists;
  gameState.goalsThisYear += gameState.goals;
  gameState.assistsThisYear += gameState.assists;
}

function calculateWinningChances() {
  for (const compName in gameState.competitions) {
      const comp = gameState.competitions[compName];
      let baseWinChance = 0;
      switch (compName) {
          case 'league':
              baseWinChance = gameState.preparationPercentage + 50;
              break;
          case 'copaDelRey':
              baseWinChance = gameState.preparationPercentage;
              break;
          case 'championsLeague':
              baseWinChance = gameState.preparationPercentage - 40;
              break;
          case 'copaAmerica':
              baseWinChance = gameState.preparationPercentage - 20;
              break;
          case 'worldCup':
              baseWinChance = gameState.preparationPercentage - 50;
              break;
      }

      // Adjust for popularity
      let fanAdj = 0;
      if (gameState.fanPopularity < 5) {
          fanAdj = -10;
      } else if (gameState.fanPopularity > 10) {
          fanAdj = 5;
      }

      let officialsAdj = 0;
      if (gameState.officialsPopularity < 5) {
          officialsAdj = -20;
      } else if (gameState.officialsPopularity > 10) {
          officialsAdj = 10;
      }

      let briberyEffect = comp.bribed ? 120 : 0;

      let finalWinChance = baseWinChance + fanAdj + officialsAdj + briberyEffect;
      finalWinChance = Math.max(0, Math.min(100, finalWinChance)); // Cap between 0 and 100

      comp.baseWinChance = baseWinChance;
      comp.finalWinChance = finalWinChance;
  }
}

async function simulateCompetitionsFirstSemester(competitionsList) {
  for (const compName of competitionsList) {
      const comp = gameState.competitions[compName];

      // Calculate elimination chance
      const eliminationChance = (comp.finalWinChance + 100);
      const eliminationRoll = Math.random(0, 1) * 100;

      if (eliminationRoll > eliminationChance) {
          comp.eliminated = true;
      } else {
          comp.eliminated = false;
      }
  }
}

async function simulateCompetitionsSecondSemester(competitionsList) {
  for (const compName of competitionsList) {
      const comp = gameState.competitions[compName];

      // Skip Copa America and World Cup if not in scheduled years
      if ((compName === 'copaAmerica' || compName === 'worldCup') && gameState.age % 4 !== 0) {
          comp.won = false;
          continue;
      }

      if (compName !== 'league' && comp.eliminated) {
          comp.won = false; // Already eliminated in first semester
          continue;
      }

      const winRoll = Math.random() * 100;
      if (winRoll < comp.finalWinChance) {
          comp.won = true;
      } else {
          comp.won = false;
      }
  }
}

function updateFanPopularityAfterCompetitionsFirstSemester(competitionsList) {
  for (const compName of competitionsList) {
      const comp = gameState.competitions[compName];
      if (compName === 'league') {
          // Do not update fan popularity for league in first semester
          continue;
      }
      if (comp.eliminated) {
          // Decrease fan popularity if eliminated
          let fanDecrease = 0;
          switch (compName) {
              case 'copaDelRey':
                  fanDecrease = 3;
                  break;
              case 'championsLeague':
                  fanDecrease = 5;
                  break;
          }
          gameState.fanPopularity -= fanDecrease;
          renderResponse(`You were eliminated from the ${formatCompetitionName(compName)}. Fan popularity decreased by ${fanDecrease}.`);
      } else {
          renderResponse(`You advanced in the ${formatCompetitionName(compName)}! Fans are excited!`);
      }
  }
}

function updateFanPopularityAfterCompetitionsSecondSemester(competitionsList) {
  for (const compName of competitionsList) {
      const comp = gameState.competitions[compName];
      if (compName === 'league' || compName === 'copaDelRey' || compName === 'championsLeague') {
          if (comp.won) {
              // Increase fan popularity if won
              let fanIncrease = 0;
              switch (compName) {
                  case 'league':
                      fanIncrease = 5;
                      break;
                  case 'copaDelRey':
                      fanIncrease = 3;
                      break;
                  case 'championsLeague':
                      fanIncrease = 7;
                      break;
              }
              gameState.fanPopularity += fanIncrease;
              renderResponse(`You won the ${formatCompetitionName(compName)}! Fan popularity increased by ${fanIncrease}.`);
          } else {
              // Decrease fan popularity if didn't win
              let fanDecrease = 0;
              switch (compName) {
                  case 'league':
                      fanDecrease = 2;
                      break;
                  case 'copaDelRey':
                      fanDecrease = 1;
                      break;
                  case 'championsLeague':
                      fanDecrease = 2;
                      break;
              }
              gameState.fanPopularity -= fanDecrease;
              renderResponse(`You did not win the ${formatCompetitionName(compName)}. Fan popularity decreased by ${fanDecrease}.`);
          }
      }
      // For Copa America and World Cup, you can add similar logic if desired
  }
}

function calculateLeaguePoints() {
  const league = gameState.competitions.league;
  const semesterWinChance = league.finalWinChance;
  const semesterPoints = (60 + 40 * (semesterWinChance / 100)) / 2;
  gameState.totalLeaguePoints += semesterPoints;
  renderResponse(`You earned ${semesterPoints.toFixed(2)} league points this semester. Total points: ${gameState.totalLeaguePoints.toFixed(2)}.`);
}

async function handleBriberyOpportunities() {
  if (gameState.semester === 2 && gameState.officialsPopularity > 5) {
      let briberyEvents = 0;
      if (gameState.officialsPopularity > 20) {
          briberyEvents = 3;
      } else if (gameState.officialsPopularity > 10) {
          briberyEvents = 2;
      } else {
          briberyEvents = 1;
      }
      for (let i = 0; i < briberyEvents; i++) {
          await conductBriberyEvent();
      }
  } else {
      renderResponse("Officials' popularity not high enough to consider bribery.");
      await waitForOK();
  }
}

async function conductBriberyEvent() {
  // Bribery will 100% occur
  // Determine eligible competitions
  const eligibleCompetitions = [];
  const briberyWeights = {
      copaDelRey: 4,
      championsLeague: 2,
      copaAmerica: 3,
      worldCup: 1,
  };

  for (const comp in briberyWeights) {
      const competition = gameState.competitions[comp];
      if (!competition.bribed && !gameState.previousBribes.includes(comp) && !competition.eliminated) {
          // Check if competition is scheduled
          if ((comp === 'copaAmerica' || comp === 'worldCup') && gameState.age % 4 !== 0) {
              continue;
          }
          for (let i = 0; i < briberyWeights[comp]; i++) {
              eligibleCompetitions.push(comp);
          }
      }
  }

  if (eligibleCompetitions.length > 0) {
      const selectedComp = eligibleCompetitions[getRandomInt(0, eligibleCompetitions.length - 1)];
      const compName = formatCompetitionName(selectedComp);
      renderStats();
      const gameContainer = document.getElementById('game-container');

      // Remove any existing response
      if (renderer.responseElement) {
          gameContainer.removeChild(renderer.responseElement);
          renderer.responseElement = null;
      }

      renderer.messageElement = createElement('div', 'message', `Do you want to bribe officials for the ${compName}? This will increase your chance of winning by 80%.`);
      gameContainer.appendChild(renderer.messageElement);

      renderer.choicesContainer = createElement('div', '', [
          createButton('Yes', () => briberyChoice(selectedComp, true)),
          createButton('No', () => briberyChoice(selectedComp, false)),
      ]);
      renderer.choicesContainer.style.display = 'flex';
      renderer.choicesContainer.style.gap = '10px'; // Sets a 10px gap between items
      gameContainer.appendChild(renderer.choicesContainer);

      await waitForPlayerChoice();

      renderResponse(renderer.lastAction);

      // Remove previous choices and message
      gameContainer.removeChild(renderer.messageElement);
      gameContainer.removeChild(renderer.choicesContainer);
      renderer.messageElement = null;
      renderer.choicesContainer = null;

      await waitForOK();
  } else {
      renderResponse('No competitions available for bribery.');
      await waitForOK();
  }
}

function briberyChoice(comp, choice) {
  if (choice) {
    gameState.competitions[comp].bribed = true;
    gameState.previousBribes.push(comp);
    renderer.lastAction = `You decided to bribe officials for the ${formatCompetitionName(comp)}. Winning is so much easier with friends in high places!`;
  } else {
    renderer.lastAction = `You passed on bribing officials for the ${formatCompetitionName(comp)}. A risky choice, but who needs ethics in football?`;
  }
  if (renderer.choiceResolve) {
    renderer.choiceResolve();
    renderer.choiceResolve = null;
  }
}

async function showCompetitionResults(competitionsList) {
  updateStateIndicator('Competition Results');
  for (const compName of competitionsList) {
      const comp = gameState.competitions[compName];
      if (comp.eliminated) {
          renderResponse(`You were eliminated from the ${formatCompetitionName(compName)}.`);
      } else {
          renderResponse(`You advanced in the ${formatCompetitionName(compName)}!`);
      }
      await waitForOK();
  }
}

async function showPersonalAchievements() {
  updateStateIndicator('Personal Achievements');

  // Remove any existing response
  if (renderer.responseElement) {
      const gameContainer = document.getElementById('game-container');
      gameContainer.removeChild(renderer.responseElement);
      renderer.responseElement = null;
  }

  renderResponse(`This semester, you scored ${gameState.goals.toFixed(2)} goals and made ${gameState.assists.toFixed(2)} assists.`);
  await waitForOK();
}

async function showYearlyAchievements() {
  updateStateIndicator('Yearly Achievements');

  // Remove any existing response
  if (renderer.responseElement) {
      const gameContainer = document.getElementById('game-container');
      gameContainer.removeChild(renderer.responseElement);
      renderer.responseElement = null;
  }

  renderResponse(`This year, you scored ${gameState.goalsThisYear.toFixed(2)} goals and made ${gameState.assistsThisYear.toFixed(2)} assists.`);
  await waitForOK();
}

async function showTrophiesWon(competitionsList) {
  updateStateIndicator('Trophies Won');
  for (const compName of competitionsList) {
      const comp = gameState.competitions[compName];
      if ((compName === 'copaAmerica' || compName === 'worldCup') && gameState.age % 4 !== 0) {
          renderResponse(`The ${formatCompetitionName(compName)} did not occur this year.`);
      } else if (comp.won) {
          renderResponse(`You won the ${formatCompetitionName(compName)}!`);
      } else {
          renderResponse(`You did not win the ${formatCompetitionName(compName)}.`);
      }
      await waitForOK();
  }
}

async function showPersonalTrophies() {
  updateStateIndicator('Personal Trophies');

  // Remove any existing response
  if (renderer.responseElement) {
      const gameContainer = document.getElementById('game-container');
      gameContainer.removeChild(renderer.responseElement);
      renderer.responseElement = null;
  }

  calculateBallonDorScore();
  await determineBallonDorWinner(); // Made async to allow for more interaction
  await waitForOK();
  determinePuskasAwardWinner();
  await waitForOK();
}

function calculateBallonDorScore() {
  let score = 0;
  const compWins = gameState.competitions;

  if (compWins.copaDelRey.won) score += 2;
  if (compWins.league.won) score += 4;
  if (compWins.copaAmerica.won) score += 5;
  if (compWins.championsLeague.won) score += 6;
  if (compWins.worldCup.won) score += 7;

  score += Math.floor(gameState.goalsThisYear / 15);
  score += Math.floor(gameState.assistsThisYear / 10);

  gameState.ballonDorScore = score;
}

async function determineBallonDorWinner() {
  const rivalScore = calculateRivalScore();
  const officialInfluence = Math.floor(gameState.officialsPopularity / 3);
  const totalScore = gameState.ballonDorScore + officialInfluence;

  renderResponse(`Ballon d'Or Announcement!`);
  await waitForOK();

  renderResponse(`Your Score: ${gameState.ballonDorScore} (Performance) + ${officialInfluence} (Officials' Influence) = ${totalScore}`);
  await waitForOK();

  // Breakdown of Ronaldo's score
  const rivalPerformanceScore = rivalScore - 3; // Subtracting base popularity score
  renderResponse(`Rival's Score (Ronaldo): ${rivalPerformanceScore + 3} (Performance) + 0 (Officials' Influence) = ${rivalScore}`);
  await waitForOK();

  if (totalScore >= rivalScore) {
    gameState.ballonDorsWon += 1;
    updateBallonDorCount(); // Update the Ballon d'Or count display
    renderResponse("Congratulations! You've won the Ballon d'Or! Who needs talent when you've got connections?");
  } else {
    renderResponse("You didn't win the Ballon d'Or this year. Seems like Ronaldo's still got it, or maybe you need to schmooze more officials.");
  }
}

function calculateRivalScore() {
  const rivalGoals = 40 + getRandomInt(10, 40);
  const rivalAssists = 30 + getRandomInt(5, 20);
  const rivalPerformanceScore = Math.floor(rivalGoals / 15) + Math.floor(rivalAssists / 10) + getRandomInt(5, 10);
  return rivalPerformanceScore; // Rival's base popularity score
}

function determinePuskasAwardWinner() {
  if (gameState.celebrationOccurred) {
      const winChance = gameState.fanPopularity >= 10 ? 0.5 : 0.2;
      if (Math.random() < winChance) {
          gameState.puskasWon += 1;
          renderResponse('Congratulations! You have won the Puskás Award! Who needs skill when you have style?');
      } else {
          renderResponse('You did not win the Puskás Award this year. Maybe a flashier celebration next time?');
      }
  } else {
      renderResponse('You were not eligible for the Puskás Award this year. Celebrations do matter!');
  }
}

function showEndGame(message) {
  updateStateIndicator('Game Over');
  const gameContainer = document.getElementById('game-container');

  // Remove any existing response
  if (renderer.responseElement) {
      gameContainer.removeChild(renderer.responseElement);
      renderer.responseElement = null;
  }

  const endMessage = createElement('div', 'message', message);
  gameContainer.appendChild(endMessage);

  // Add hint message
  const hintMessage = createElement('div', 'hint', "Hint: If you don't know how to play the game, just spend all time in fan popularity and officials relationships.");
  gameContainer.appendChild(hintMessage);

  const finalStats = createElement('div', 'message', [
      'Final Stats:',
      createElement('br'),
      `Age: ${gameState.age}`,
      createElement('br'),
      `Total Goals: ${gameState.totalGoals.toFixed(2)}`,
      createElement('br'),
      `Total Assists: ${gameState.totalAssists.toFixed(2)}`,
      createElement('br'),
      `Ballon d'Ors Won: ${gameState.ballonDorsWon}`,
      createElement('br'),
      `Puskás Awards Won: ${gameState.puskasWon}`,
      createElement('br'),
      `Fan Popularity: ${gameState.fanPopularity}`,
      createElement('br'),
      `Officials' Popularity: ${gameState.officialsPopularity}`,
  ]);
  gameContainer.appendChild(finalStats);

  const playAgainBtn = createButton('Play Again', () => {
      init();
  });
  gameContainer.appendChild(playAgainBtn);
}

function updateStateIndicator(state) {
  const gameContainer = document.getElementById('game-container');
  if (renderer.stateIndicator) {
      gameContainer.removeChild(renderer.stateIndicator);
  }
  renderer.stateIndicator = createElement('div', 'state-indicator', `Current State: ${state}`);
  gameContainer.insertBefore(renderer.stateIndicator, renderer.stats ? renderer.stats.nextSibling : gameContainer.firstChild);
}

function formatCompetitionName(compName) {
  switch (compName) {
      case 'league':
          return 'League';
      case 'copaDelRey':
          return 'Copa del Rey';
      case 'championsLeague':
          return 'Champions League';
      case 'copaAmerica':
          return 'Copa América';
      case 'worldCup':
          return 'World Cup';
      default:
          return compName;
  }
}

// Helper Functions
function createElement(tag, className = '', content = '') {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (Array.isArray(content)) {
      content.forEach(child => {
          if (typeof child === 'string') {
              element.appendChild(document.createTextNode(child));
          } else {
              element.appendChild(child);
          }
      });
  } else if (typeof content === 'string') {
      element.textContent = content;
  }
  return element;
}

function createButton(text, onclick) {
  const button = createElement('span', 'button', text);
  button.addEventListener('click', onclick);
  return button;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function waitForOK() {
  return new Promise(resolve => {
      const gameContainer = document.getElementById('game-container');
      const okButton = createButton('OK', () => {
          // Safely remove elements if they exist and are in the DOM
          if (renderer.responseElement && renderer.responseElement.parentNode === gameContainer) {
              gameContainer.removeChild(renderer.responseElement);
              renderer.responseElement = null;
          }
          if (renderer.messageElement && renderer.messageElement.parentNode === gameContainer) {
              gameContainer.removeChild(renderer.messageElement);
              renderer.messageElement = null;
          }
          if (renderer.choicesContainer && renderer.choicesContainer.parentNode === gameContainer) {
              gameContainer.removeChild(renderer.choicesContainer);
              renderer.choicesContainer = null;
          }
          if (okButton && okButton.parentNode === gameContainer) {
              gameContainer.removeChild(okButton);
          }
          resolve();
      });
      gameContainer.appendChild(okButton);
  });
}

function openInfoDialog() {
    // Check if the dialog is already open
    if (renderer.dialog) {
        return; // Dialog is already open, do nothing
    }

    // Disable the Info button
    if (renderer.infoButton) {
        renderer.infoButton.disabled = true;
    }

    const gameContainer = document.getElementById('game-container');

    // Create dialog elements
    renderer.dialog = createElement('div', 'dialog', '');
    renderer.dialogHeading = createElement('div', 'dialog-heading', 'Game Info');
    renderer.closeBtn = createElement('div', 'close-button', '[Close]');
    renderer.closeBtn.addEventListener('click', closeInfoDialog);

    renderer.dialogContent = createElement('div', '', '');

    renderer.dialog.appendChild(renderer.closeBtn);
    renderer.dialog.appendChild(renderer.dialogHeading);
    renderer.dialog.appendChild(renderer.dialogContent);

    gameContainer.appendChild(renderer.dialog);

    // Add satirical info content
    renderer.dialogContent.appendChild(createElement('p', '', 'Welcome to the Satirical Footballer Game!'));
    renderer.dialogContent.appendChild(createElement('p', 'gold-text', 'Goal: win the ballon d\'Or by any means necessary!'));
    renderer.dialogContent.appendChild(createElement('p', '', 'In this game, fame is more important than skill.'));
    renderer.dialogContent.appendChild(createElement('p', '', 'Despite your performance, you might still win prestigious awards if you are popular enough!'));

    renderer.dialogContent.appendChild(createElement('h2', '', 'Ballon d\'Or Controversy'));
    renderer.dialogContent.appendChild(createElement('p', '', 'The Ballon d\'Or is a prestigious award given to the best footballer in the world.'));
    renderer.dialogContent.appendChild(createElement('p', '', 'The Ballon d\'Or is hosted only once every year, and the winner is decided by a panel of journalists, coaches, and captains of national teams.'));
    renderer.dialogContent.appendChild(createElement('p', '', 'In this game, you will compete against one of the most diclined and skilled footballer, Ronaldo, for the Ballon d\'Or.'));
    renderer.dialogContent.appendChild(createElement('p', '', 'Although this might seem impossible, keep in mind that the ballon d\'or is voted by officals ONLY. Therefore, only players with strong social network are elagible to win'));
    renderer.dialogContent.appendChild(createElement('p', 'gold-text', '"If coruption didn\'t exist, then how did I become the greatest of all time" - Quote acted out by Lional Messi'));
    renderer.dialogContent.appendChild(createElement('p', '', 'Will you rise to fame and win the Ballon d\'Or? I Guess only the officials will know! Remember, It\'s all about who you know and how you play the game!'));

    renderer.dialogContent.appendChild(createElement('p', '', 'Good luck becoming the most famous footballer, regardless of your on-pitch abilities!'));

    renderer.dialogContent.appendChild(createElement('h2', '', 'Ballon d\'Or History'));
    renderer.dialogContent.appendChild(createElement('p', '', 'The Ballon d\'Or is a prestigious award given to the best footballer in the world.'));
    renderer.dialogContent.appendChild(createElement('p', '', 'The Ballon d\'Or was first awarded in 1956, aiming to recognize the best football player in Europe.'));
    renderer.dialogContent.appendChild(createElement('p', '', 'Over the years, it has evolved into a global award, supposedly honoring the best player in the world.'));
    renderer.dialogContent.appendChild(createElement('p', '', 'However, in recent year, the award has became a tool to profit out of. The main reason being that clubs will get more sponsorship deals, shirt sales and player worth by having a ballon d\'ors winner on their team.'));
    renderer.dialogContent.appendChild(createElement('p', '', 'Players like Ribery, Inesta, Van Dyke, Levandovski, Haaland, Vinicius Jr were all vicitims of well named ballon d\'or robberies in the past 10 years. Interestingly 4 out of 8 ballon dor\'s robbed was given to the same person -- Lional Messi.'));
    renderer.dialogContent.appendChild(createElement('p', '', 'The ballon d\'or ceremony in October 2024 took coruption to the next level. With results leaked to the public months before the ceremony, officals managed to swap out Vinicius Jr(ranked 1st), renaming Rodri(ranked 3rd) as the ballon d\'ors winner of 2024. Till this day no one knows why FIFA decided to alter the results'));
    renderer.dialogContent.appendChild(createElement('p', '', 'In this game, we embrace that notion, highlighting the importance of social network over skill.'));
    renderer.dialogContent.appendChild(createElement('p', '', 'Your journey will involve navigating the world of media, building relationships, and winning the ballon d\'or.'));
    renderer.dialogContent.appendChild(createElement('p', '', 'Remember, in the world of football, sometimes it\'s not about how well you play, but how much your influence extend.'));

}

function closeInfoDialog() {
  const gameContainer = document.getElementById('game-container');
  if (renderer.dialog) {
      gameContainer.removeChild(renderer.dialog);
      renderer.dialog = null;
  }

  // Re-enable the Info button
  if (renderer.infoButton) {
      renderer.infoButton.disabled = false;
  }
}

function showSpecialEnding() {
  updateStateIndicator('Game Over');
  const gameContainer = document.getElementById('game-container');

  // Clear the game container
  gameContainer.innerHTML = '';

  // Display special ending message
  const endMessage = createElement('div', 'message', 'Your popularity with officials has reached 100! They decide to reward you with the lifetime Ballon d\'Or award!!!');
  gameContainer.appendChild(endMessage);

  // Display text art (You can add any ASCII art here if you like)
  const textArt = createElement('pre', 'text-art', `
🎉🏆 Congratulations! You've achieved legendary status! 🏆🎉
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⡀⣀⣠⣤⣤⣄⣤⣀⢀⠀⠀⢀⣤⣀⣄⣤⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣤⣴⣶⣟⢻⣿⣿⣿⣿⣷⣿⣿⣿⣿⣶⣿⣷⣶⣼⣿⣿⣶⣿⣿⣶⣤⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡄⣺⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣤⣄⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣇⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣶⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢑⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣦⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣆⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠢⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⢀⢾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠎⣾⣿⣿⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⢀⣴⣿⣿⣿⢿⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠿⠿⠙⠛⠉⠉⠁⠀⠀⠀⠀⠉⠙⠋⠙⢿⠙⢟⡽⣿⠻⢿⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⡀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⡰⡟⠁⠛⣿⣷⣿⣿⣿⣿⣿⣿⣿⣿⡟⠁⠉⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠓⠒⠛⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣄⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠸⠁⠀⢠⢾⣿⣿⣿⣿⣿⣿⣿⣿⣿⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢫⠁⢺⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠈⣼⣿⣿⣿⣿⣿⣿⣿⣿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⡀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⣿⣿⣿⢻⣿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣌⠀⠐⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⡫⣿⣗⡦⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⣿⣿⣿⣿⣿⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡧⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠠⣿⡜⢻⠇⠀⡠⠊⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠧⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢁⡎⡠⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⣿⣿⣿⣿⣿⣿⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣾⣿⣶⣶⣦⣤⣀⠀⠄⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢻⣿⣿⣿⣿⣿⣿⡀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠁⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣿⣿⣿⠿⣿⣿⣿⣿⣿⣈⠁⠐⠈⡁⠀⠌⠁⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⣿⣿⣧⡟⣿⣿⢼⣯⣿⣿⡿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢽⡿⠁⠤⠒⠛⢿⣿⣿⣷⣄⠠⠀⢀⠀⠒⠛⣿⣿⣿⣿⣿⣾⣷⣶⣶⣶⣶⣶⣦⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⣽⡿⣕⣿⣿⣿⣽⣿⣿⣿⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⠁⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⡅⢀⣠⣞⣛⡛⢛⢻⡿⣿⡆⠀⠀⠀⠁⠀⠀⠭⣉⣻⣿⣿⣿⣿⡟⠛⠻⠿⠿⢿⣿⣧⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢳⣿⢻⣼⣿⣿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠇⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⣟⣿⣿⣿⣿⠻⢷⠶⣽⠃⠀⠀⠀⠀⠀⢀⢴⣿⣿⣿⣿⣿⣿⣿⣷⡦⣤⣀⠀⠠⠈⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠨⣿⣿⣿⢿⣿⣿⡟⣿⣿⣿⣿⡿⠿⠿⠿⣿⣿⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢣⠀⠋⢺⣿⣿⣭⣿⣻⠃⠀⠀⠀⠀⠀⠀⠀⠀⠿⣿⣿⣿⢿⣿⣟⣻⡿⠿⠾⢽⣲⠤⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⣿⣿⣼⢿⡟⠀⣡⡼⠛⠁⣀⡠⠴⣖⢻⡃⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⠹⢿⡿⠿⢹⠇⠀⠀⠀⠀⠀⠀⠀⠸⠀⠀⠀⢸⣿⡿⢶⣾⣁⣀⠀⠀⠀⠉⠹⠆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⣿⣿⣷⠏⢀⡿⠁⠀⢀⣾⠉⠀⠀⢿⣇⢱⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⠀⠀⠀⠀⠀⠀⠈⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠙⠒⠀⠈⠉⠒⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣿⡟⠋⠐⢉⡠⣄⣴⣿⡿⠀⣨⣁⠘⣿⣇⢧⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀⠀⡼⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⡇⠀⠀⠀⠀⢟⠛⠟⠃⠀⠸⣇⠀⢸⣿⠸⡆⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀⡴⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣸⡅⠀⠀⠀⠀⣿⣶⣀⠀⠀⠀⠹⡄⢸⡇⢸⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⡜⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⠤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿⣼⠀⠀⠀⢱⣄⣿⣿⣿⣷⠀⠀⠁⣿⡾⠅⡼⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢡⠀⠀⠀⢺⣄⠀⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢘⡆⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣾⣿⡷⠀⠀⠀⠀⣿⡿⠉⡉⢻⣷⣤⢢⢏⡟⢠⠃⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣦⢀⣄⠠⠝⣿⣿⢿⣦⣤⣤⣶⣶⣶⣦⣄⣠⣴⠇⠱⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣴⣿⣿⣿⡇⠀⠀⠀⢠⣿⠋⣀⠄⣸⣿⡷⢋⣾⠃⡞⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⡫⠅⠀⠀⠈⠙⢻⣿⣯⣭⣭⡭⣙⣿⡿⠛⠁⠀⠀⠘⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡠⠀⣾⣿⣿⣿⣷⣿⢧⠀⠀⠀⠿⠥⠞⠁⠈⠉⢉⣴⡿⠁⡜⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⡄⠀⠈⠀⣀⣴⣿⣿⣿⣽⣷⣿⣿⣿⣶⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣧⠞⣿⣿⣿⡟⣿⣷⠀⢳⣿⣶⣦⣤⠤⠲⠞⠛⠛⢁⡠⠊⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣧⡈⢀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣧⢼⣿⣟⣯⣿⣟⣿⣿⣿⢳⣾⣿⡌⠛⠐⠀⠀⠀⢀⠔⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣹⣿⣷⣿⣿⣿⣿⣿⣿⡛⣛⣛⣿⣟⡿⣿⣿⣿⣿⣿⣿⣿⣦⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣰⣀⣻⣿⣾⣿⣾⣿⡿⣿⣿⣿⣿⣴⣧⣿⣿⣦⣀⣀⣴⠖⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⡿⣿⣿⣿⣿⣿⣿⣿⣭⣿⣿⣿⣿⣿⣿⣿⣿⣇⠀⠀⠀⠀⠀⣤⣬⣿⣿⣿⢿⣿⣿⣿⣿⣿⣧⡿⣿⣿⣿⠂⣙⣿⣿⠟⠃⠀⡝⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⡟⢊⣻⣈⠉⠉⠉⠉⠁⠈⠉⠚⠉⠉⠘⣿⣿⣿⣿⣿⡆⠀⢀⢀⣾⣿⣿⣿⣿⣿⣿⢻⣿⣿⣿⣽⣻⣿⣿⣽⡿⠤⠁⠙⠁⠀⠀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⢠⢴⠄⠀⠀⠀⠀⠀⠀⠈⣿⣿⣿⣿⣿⣷⣀⣤⣶⣿⣦⣭⣬⣍⣀⠂⠀⠀⠀⠀⠈⢿⣿⣿⣿⣟⣷⣸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⣿⠀⠀⠀⠀⠀⠀⠀⢸⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⢸⡮⡼⢿⠀⠀⠀⠀⠀⠀⢹⣿⣿⣿⣿⣿⣯⠘⢿⣿⣿⣿⣿⣿⢿⣞⠀⠀⢀⡀⢠⣤⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣾⣿⠀⠀⠀⠀⠀⠀⠀⢸⣜⢳⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠈⠛⠁⠀⢠⠀⢀⣀⣤⠀⢀⣿⣿⣿⣿⣿⣧⠎⢸⣿⣿⣿⣿⡿⠌⠀⠄⠁⠄⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⠀⠀⠀⠀⠀⠀⠀⢸⠀⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢠⡏⢳⡀⠀⢀⢸⡼⠗⠻⠋⠀⠀⡜⡯⣿⣿⣿⣿⣿⣿⣮⣿⣟⣿⣏⣁⣦⣀⡀⣀⢲⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⡿⠀⣿⣿⣿⣷⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠈⠣⣌⠙⠛⠛⢉⣉⡹⢄⡟⠒⢠⢦⣮⡹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡏⢹⣿⣿⣿⣿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⣩⣴⣒⡾⠋⡹⣄⠀⠀⠀⠀⡨⡡⣪⠜⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⡃⣸⣿⠿⢿⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠈⠉⢹⡏⠀⠀⢱⣿⡾⠏⠀⠐⢅⠤⠋⢗⡃⣹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡏⠀⣿⡿⢷⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⢒⣩⣥⣴⣶⣿⣿⠻⣥⠛⢲⡸⢅⣪⣻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠗⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⠁⢸⢻⣧⣿⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⣀⣤⣶⣾⣿⣿⣿⣿⡿⣿⢿⣧⡏⣞⡦⡆⡄⢤⣲⣠⠫⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠛⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠇⢠⣾⢿⣿⣿⣿⣿⣿⣿⣶⣶⣤⣀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⢸⣿⣿⣿⣿⣿⣻⢫⠝⣮⣩⣷⣍⣿⣼⣹⡵⣓⠨⡑⢊⣺⢭⠎⣝⠻⠟⡻⡿⢟⣝⣻⠿⡿⠿⠿⠿⠿⠟⣋⠪⠍⠊⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡞⡀⣹⣿⣿⣾⣟⣿⣿⣿⣞⣿⣿⣿⣯⣝⢦⡀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠘⣿⣿⣿⣿⣿⣷⣯⠭⣤⢧⣼⣹⠿⢻⣷⣯⣿⡁⡁⠐⣬⠣⡥⠍⣿⢻⢦⣕⡷⣶⣶⣶⣶⣶⣶⣾⣾⣾⣱⢦⠙⠁⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡼⡡⣼⣿⣿⣿⣿⣿⣿⣿⡇⠽⡳⢋⡽⣿⣿⣿⣯⡀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⢰⣿⣿⣿⣿⣿⣿⣷⣼⣳⣿⣴⣶⣾⡝⣻⢾⣿⣶⢽⡍⠁⠱⠒⡾⠋⠴⣿⢿⠝⣽⣤⣟⠛⠿⣿⣿⣿⣿⣽⣾⣋⠔⠂⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⠀⠦⡾⠑⣽⣿⣿⣿⣿⣿⣿⣿⡿⣵⠁⢶⠁⠇⡈⡛⢷⢻⠁⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠐⣿⣿⣿⣿⣟⣻⣿⡿⣿⣿⣿⡟⣿⢻⢿⣻⣿⣷⣿⢶⣧⡀⠜⠉⣻⣶⣿⣫⣫⡾⠢⣹⣧⣶⣤⣌⣉⠛⠿⢮⣉⡉⠒⠀⠀⠀⠀⠀⠀⠀⢀⠀⠄⠀⣃⠤⠰⣼⠛⢴⣞⣿⢋⣻⣿⣿⣿⣟⣙⠭⡍⣃⠬⣅⠐⡀⢂⢟⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠠⣿⣿⡿⠷⠿⣯⡿⣿⣿⡿⣿⣿⣾⣿⣿⣿⡿⣾⠿⢿⣿⢿⣽⣽⢿⢷⢿⣟⣿⣿⣼⢟⢿⣷⣷⣾⣿⣹⣦⣦⣌⡉⠲⣄⡀⠀⠀⠀⢀⠀⠀⠀⠀⣕⢓⢈⣾⠇⢨⡼⣿⣻⣼⣿⣿⣿⣻⣰⣶⡆⠲⠤⠖⠛⠐⠊⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠙⠛⠂⠈⠐⠚⠛⠛⠓⠛⠚⠛⠛⠓⠛⠛⠒⠛⠒⠁⠚⠈⠘⡛⡛⣷⢶⢿⠿⠯⠞⠝⠽⠟⠿⡿⠿⣿⣿⣿⣿⣻⣷⡦⠹⠔⠀⠀⠀⠀⠄⡬⡎⠈⡀⠱⠏⠨⠞⠻⠿⠿⠿⠟⠛⠓⠁⠈⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠓⢴⠜⣢⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⢉⡉⠁⠀⠀⠀⠀⠠⠂⠀⠀⠄⠐⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
  `);
  gameContainer.appendChild(textArt);

  // Display final stats
  const finalStats = createElement('div', 'message', [
      'Final Stats:',
      createElement('br'),
      `Age: ${gameState.age}`,
      createElement('br'),
      `Total Goals: ${gameState.totalGoals.toFixed(2)}`,
      createElement('br'),
      `Total Assists: ${gameState.totalAssists.toFixed(2)}`,
      createElement('br'),
      `Ballon d'Ors Won: ${gameState.ballonDorsWon}`,
      createElement('br'),
      `Puskás Awards Won: ${gameState.puskasWon}`,
      createElement('br'),
      `Fan Popularity: ${gameState.fanPopularity}`,
      createElement('br'),
      `Officials' Popularity: ${gameState.officialsPopularity}`,
  ]);
  gameContainer.appendChild(finalStats);

  // "Try Again" button
  const playAgainBtn = createButton('Play Again', () => {
      init();
  });
  gameContainer.appendChild(playAgainBtn);
}

function showNotification(message) {
  const gameContainer = document.getElementById('game-container');

  // Remove any existing notification
  if (renderer.notificationElement) {
    gameContainer.removeChild(renderer.notificationElement);
  }

  renderer.notificationElement = createElement('div', 'notification', message);
  gameContainer.appendChild(renderer.notificationElement); // Append at the bottom
}

function updateBallonDorCount() {
  if (renderer.stats) {
    const ballonDorElement = renderer.stats.querySelector('div:nth-child(4)');
    if (ballonDorElement) {
      ballonDorElement.textContent = `Ballon d'Ors Won: ${gameState.ballonDorsWon}`;
    }
  }
}
