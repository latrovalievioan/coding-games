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
  if (n === 0) return 0
  if (n === 1) return 1

  let f0 = 0;
  let f1 = 1;

  for (let i = 2; i <= n; ++i) {
    [f0, f1] = [f1, f0 + f1]
  }

  return f1
}

const calcZombieScore = (humans: Entity[]) => humans.length ** 2 * 10;

const calcFrameKillScore = (killedZombies: Entity[], humans: Entity[]) => {
  if (killedZombies.length > 1) {
    let points = 0;

    for(let i = 0; i < killedZombies.length; i++) {
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
  if ((bestScoreWithSteps.score <= score && !zombies.length)) {
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
    for (let i = 0; i < aliveZombies.length; i++) {
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

  if (i === 0) {
    for (let i = 0; i < zombies.length; i++) {
      const zombie = zombies[i];
      runSimulation(humans, zombies, ash, 0, zombie, [zombie]);
    }
  }

  const lastStepsIndex = bestScoreWithSteps.steps.length - 1;

  const indexWith = i <= lastStepsIndex ? i : lastStepsIndex;

  console.error({lastStepsIndex, indexWith})

  console.log(
    `${Math.floor(bestScoreWithSteps.steps[indexWith].x)} ${Math.floor(bestScoreWithSteps.steps[indexWith].y)}`,
  );

  i++;
}
