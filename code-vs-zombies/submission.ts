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

type HumanWithNearestZombie = {
  human: Entity;
  zombie: Entity;
  zombieToHumanDistance: number;
  ashToHumanDistance: number;
  ashToZombieDistance: number;
};

const ZOMBIE_SPEED = 400;
const ASH_SPEED = 1000;
const BULLET_DISTANCE = 2000;
const MAX_X = 16_000;
const MID_X = MAX_X / 2;

const calcVecDist = (a: Vector, b: Vector) => {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
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

const mapHumansWithNearestZombie = (
  ash: Entity,
  humans: Entity[],
  zombies: Entity[],
) => {
  const humansWithNearestZombies: HumanWithNearestZombie[] = [];

  for (let i = 0; i < humans.length; i++) {
    const human = humans[i];

    const result: Partial<HumanWithNearestZombie> = {
      human,
    };

    for (let j = 0; j < zombies.length; j++) {
      const zombie = zombies[j];
      const zombieToHumanDistance = calcVecDist(zombie, human);

      if (
        !result.zombieToHumanDistance ||
        zombieToHumanDistance < result.zombieToHumanDistance
      ) {
        const ashToHumanDistance = calcVecDist(human, ash);

        const ashToZombieDistance = calcVecDist(ash, zombie);

        result.zombie = zombie;
        result.zombieToHumanDistance = zombieToHumanDistance;
        result.ashToHumanDistance = ashToHumanDistance;
        result.ashToZombieDistance = ashToZombieDistance;
      }
    }

    humansWithNearestZombies.push(result as HumanWithNearestZombie);
  }

  return humansWithNearestZombies;
};

const calcDir = (humansWithNearestZombies: HumanWithNearestZombie[]) => {
  const leftHumans = humansWithNearestZombies.filter((h) => h.human.x > MID_X);
  const rightHumans = humansWithNearestZombies.filter(
    (h) => h.human.x <= MID_X,
  );

  const directionHumans =
    leftHumans.length > rightHumans.length ? leftHumans : rightHumans;

  const humanWithNearestZombie = directionHumans.reduce(
    (acc, curr) =>
      curr.zombieToHumanDistance < acc.zombieToHumanDistance ? curr : acc,
    {
      zombieToHumanDistance: Infinity,
      ashToHumanDistance: Infinity,
      ashToZombieDistance: Infinity,
      human: {},
      zombie: {},
    } as HumanWithNearestZombie,
  );

  return `${humanWithNearestZombie.zombie.x} ${humanWithNearestZombie.zombie.y}`;
};

const filterUnsavableHumans = (
  humansWithNearestZombies: HumanWithNearestZombie[],
) => {
  return humansWithNearestZombies.filter((humanWithNearestZombie) => {
    const zombieToHumanTime =
      humanWithNearestZombie.zombieToHumanDistance / ZOMBIE_SPEED;
    const ashToHumanTime =
      (humanWithNearestZombie.ashToHumanDistance - BULLET_DISTANCE) / ASH_SPEED;

    return zombieToHumanTime >= ashToHumanTime;
  });
};

// game loop
while (true) {
  const inputs = readline().split(" ");

  const ash: Entity = {
    x: parseInt(inputs[0]),
    y: parseInt(inputs[1]),
  };

  const humans = parseInputEntities();

  const zombies = parseInputEntities();

  const humansWithNearestZombies = mapHumansWithNearestZombie(
    ash,
    humans,
    zombies,
  );

  console.log(
    `${calcDir(filterUnsavableHumans(humansWithNearestZombies))} LEEROY JENKINS!`,
  );
}
