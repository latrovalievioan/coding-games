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
const MAX_Y = 9_000;
const MID_X = 16_000 / 2;
const MID_Y = 9_000 / 2;

const calcVecDist = (a: Vector, b: Vector) => {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
};

const findCentroid = (vectors: Vector[]) => {
  const x = vectors.reduce((acc, curr) => acc + curr.x, 0) / vectors.length;
  const y = vectors.reduce((acc, curr) => acc + curr.y, 0) / vectors.length;

  return { x, y } as Vector;
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

const calcDir = (
  humansWithNearestZombies: HumanWithNearestZombie[],
  zombies: Entity[],
) => {
  const withoutUnsavableHumans = filterUnsavableHumans(
    humansWithNearestZombies,
  );

  const leftHumans = withoutUnsavableHumans.filter((h) => h.human.x > MID_X);
  const rightHumans = withoutUnsavableHumans.filter((h) => h.human.x <= MID_X);

  const roughDirection =
    leftHumans.length > rightHumans.length ? leftHumans : rightHumans;

  const humanWithNearestZombie = roughDirection.reduce(
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

  const centroid = findCentroid([...zombies, ...roughDirection.map(x => x.human)]);

  return `${Math.floor(centroid.x)} ${Math.floor(centroid.y)}`;
}

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

  console.log(`${calcDir(humansWithNearestZombies, zombies)} LEEROY JENKINS!`);
}
