export {};

/**
 * Save humans, destroy zombies!
 **/

type Vector = {
  x: number;
  y: number;
};

type Entity = {
  id?: number;
} & Vector;

const ZOMBIE_SPEED = 400;
const ASH_SPEED = 1000;
const BULLET_DISTANCE = 2000;
const MAX_X = 16_000;
const MAX_Y = 9_000;

const fibToN = (n: number) => {
  if (n === 0) return 0;
  if (n === 1) return 1;

  let f0 = 0;
  let f1 = 1;

  for (let i = 2; i <= n; ++i) {
    [f0, f1] = [f1, f0 + f1];
  }

  return f1;
};

const calcZombieScore = (humans: Entity[]) => humans.length ** 2 * 10;

const calcFrameKillScore = (killedZombies: Entity[], humans: Entity[]) => {
  if (killedZombies.length > 1) {
    let points = 0;

    for (let i = 0; i < killedZombies.length; i++) {
      points += calcZombieScore(humans) * fibToN(i + 1 + 2);
    }

    return points;
  }

  if (killedZombies.length > 0) {
    return calcZombieScore(humans);
  }

  return 0;
};

const calcVecDist = (a: Vector, b: Vector) => {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
};

const calcFrameMove = (
  speed: number,
  currentPos: Vector,
  targetPos: Vector,
) => {
  // Calculate the direction vector from currentPos to targetPos
  const direction = {
    x: targetPos.x - currentPos.x,
    y: targetPos.y - currentPos.y,
  };

  // Calculate the distance to the target
  const distanceToTarget = calcVecDist(currentPos, targetPos);

  // If already at the target position, no need to move
  if (distanceToTarget === 0) {
    return currentPos;
  }

  // Normalize the direction vector
  const normalizedDirection = {
    x: direction.x / distanceToTarget,
    y: direction.y / distanceToTarget,
  };

  // Calculate the new position
  const newPosition = {
    x: currentPos.x + normalizedDirection.x * speed,
    y: currentPos.y + normalizedDirection.y * speed,
  };

  // Ensure we don't overshoot the target position
  if (calcVecDist(currentPos, newPosition) > distanceToTarget) {
    return targetPos;
  }

  return newPosition;
};

const parseInputEntities = () => {
  const entities: Entity[] = [];
  const entityCount = parseInt(readline());
  for (let i = 0; i < entityCount; i++) {
    const inputs = readline().split(" ");
    entities.push({
      id: parseInt(inputs[0]),
      x: parseInt(inputs[1]),
      y: parseInt(inputs[2]),
    });
  }

  return entities;
};

const moveZombies = (zombies: Entity[], humans: Entity[], ash: Entity) => {
  const humansIncludingAsh = [...humans, ash];

  return zombies.map((zombie) => {
    let closestHuman: Entity;
    let closestHumanDistance: number = Infinity;

    for (let j = 0; j < humansIncludingAsh.length; j++) {
      const human = humansIncludingAsh[j];
      const dist = calcVecDist(human, zombie);

      if (dist < closestHumanDistance) {
        closestHuman = human;
        closestHumanDistance = dist;
      }
    }

    return {
      id: zombie.id,
      ...calcFrameMove(ZOMBIE_SPEED, zombie, closestHuman),
    } as Entity;
  });
};

const killZombies = (humans: Entity[], zombies: Entity[], ash: Entity) => {
  const killedZombies = [] as Entity[];
  const aliveZombies = [] as Entity[];

  for (let i = 0; i < zombies.length; i++) {
    const zombie = zombies[i];

    if (calcVecDist(zombie, ash) <= BULLET_DISTANCE) {
      killedZombies.push(zombie);
    } else {
      aliveZombies.push(zombie);
    }
  }

  const score = calcFrameKillScore(killedZombies, humans);

  return { aliveZombies, score };
};

const moveAsh = (ash: Entity, targetZombie: Entity) =>
  calcFrameMove(ASH_SPEED, ash, targetZombie) as Entity;

const eatHumans = (zombies: Entity[], humans: Entity[]) =>
  humans.reduce((acc, human) => {
    for (let j = 0; j < zombies.length; j++) {
      const zombie = zombies[j];
      if (zombie.x === human.x && zombie.y === human.y) {
        return acc;
      }
    }
    return [...acc, human];
  }, [] as Entity[]);

const bestScoreWithSteps: { score: number; steps: Vector[] } = {
  score: 0,
  steps: [],
};

const runSimulation = (
  humans: Entity[],
  zombies: Entity[],
  ash: Entity,
  score: number,
  targetZombie: Entity,
  steps: Vector[],
) => {
  if (bestScoreWithSteps.score <= score && !zombies.length) {
    bestScoreWithSteps.score = score;
    bestScoreWithSteps.steps = steps;
    return;
  }

  if (!humans.length || !zombies.length) {
    return;
  }

  const zombiesAfterMove = moveZombies(zombies, humans, ash);

  const ashAfterMove = moveAsh(ash, targetZombie);

  const { aliveZombies, score: scoreFromKills } = killZombies(
    humans,
    zombiesAfterMove,
    ashAfterMove,
  );

  const aliveHumans = eatHumans(aliveZombies, humans);

  if (aliveZombies.length > 0) {
    for (let i = 0; i < aliveZombies.length; i += Math.ceil(aliveZombies / 2)) {
      const zombie = aliveZombies[i];
      runSimulation(
        aliveHumans,
        aliveZombies,
        ashAfterMove,
        score + scoreFromKills,
        zombie,
        [...steps, zombie],
      );
    }
  } else {
    runSimulation(
      aliveHumans,
      aliveZombies,
      ashAfterMove,
      score + scoreFromKills,
      targetZombie,
      [...steps, targetZombie],
    );
  }
};

function combineVectors(vectors, range) {
  // Create an empty array to store combined vectors
  let combinedVectors = [];

  // Iterate through each vector in the input array
  for (let i = 0; i < vectors.length; i++) {
    let currentVector = vectors[i];

    // Check if the current vector can be combined with any existing combined vector
    let combined = false;
    for (let j = 0; j < combinedVectors.length; j++) {
      let existingVector = combinedVectors[j];

      // Calculate the distance between currentVector and existingVector
      let distance = Math.sqrt(
        Math.pow(currentVector.x - existingVector.x, 2) +
          Math.pow(currentVector.y - existingVector.y, 2),
      );

      // If distance is within the range, combine them
      if (distance <= range) {
        // Combine vectors by averaging their coordinates
        existingVector.x = (existingVector.x + currentVector.x) / 2;
        existingVector.y = (existingVector.y + currentVector.y) / 2;
        combined = true;
        break;
      }
    }

    // If currentVector couldn't be combined with any existing vector, add it as a new combined vector
    if (!combined) {
      combinedVectors.push({ x: currentVector.x, y: currentVector.y });
    }
  }

  return combinedVectors;
}

let i = 0;
// game loop
while (true) {
  const inputs = readline().split(" ");

  const ash: Entity = {
    x: parseInt(inputs[0]),
    y: parseInt(inputs[1]),
  };

  const humans = parseInputEntities();
  const zombies = parseInputEntities();

  const combinedZombies = combineVectors(zombies, BULLET_DISTANCE);

  console.error(zombies.length, combinedZombies.length);

  if (i === 0) {
    for (
      let i = 0;
      i < combinedZombies.length;
      i += Math.ceil(combinedZombies.length / 2)
    ) {
      const zombie = combinedZombies[i];
      runSimulation(humans, combinedZombies, ash, 0, zombie, [zombie]);
    }
  }

  const lastStepsIndex = bestScoreWithSteps.steps.length - 1;

  const indexWith = i <= lastStepsIndex ? i : lastStepsIndex;

  console.log(
    `${Math.floor(bestScoreWithSteps.steps[indexWith].x)} ${Math.floor(bestScoreWithSteps.steps[indexWith].y)}`,
  );

  i++;
}
