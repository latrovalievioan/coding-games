// HM despite the optimization this is worse

/**
 * Save humans, destroy zombies!
 **/

type Entity = {
  id?: number;
  x: number;
  y: number;
};

type HumanWithNearestZombie = {
  human: Entity;
  zombie: Entity;
  zombieToHumanDistance: number;
  meToHumanDistance: number;
  meToZombieDistance: number;
};

type NearestZombieToMe = {
  zombieX: number;
  zombieY: number;
  dist: number;
};

const ZOMBIE_SPEED = 400;
const ME_SPEED = 1000;
const BULLET_DISTANCE = 2000;

const getEntities = () => {
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

const getHumansWithNearestZombies = (
  me: Entity,
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
      const distance = Math.sqrt(
        (human.x - zombie.x) ** 2 + (human.y - zombie.y) ** 2,
      );

      if (
        !result.zombieToHumanDistance ||
        distance < result.zombieToHumanDistance
      ) {
        const meToHumanDistance = Math.sqrt(
          (human.x - me.x) ** 2 + (human.y - me.y) ** 2,
        );

        const meToZombieDistance = Math.sqrt(
          (zombie.x - me.x) ** 2 + (zombie.y - me.y) ** 2,
        );

        result.zombieToHumanDistance = distance;
        result.zombie = zombie;
        result.meToHumanDistance = Math.floor(meToHumanDistance);
        result.meToZombieDistance = Math.floor(meToZombieDistance);
      }
    }

    humansWithNearestZombies.push(result as HumanWithNearestZombie);
  }

  return humansWithNearestZombies;
};

const getNearestZombieToMe = (me: Entity, zombies: Entity[]) => 
  zombies.reduce(
    (nearest, curr) => {
      const meToZombieDistance = Math.sqrt(
        (curr.x - me.x) ** 2 + (curr.y - me.y) ** 2,
      );

      return meToZombieDistance < nearest.dist
        ? { zombieX: curr.x, zombieY: curr.y, dist: meToZombieDistance }
        : nearest;
    },
    {
      zombieX: Infinity,
      zombieY: Infinity,
      dist: Infinity,
    } as NearestZombieToMe,
  );


const calcDir = (
  me: Entity,
  zombies: Entity[],
  humansWithNearestZombies: HumanWithNearestZombie[],
) => {
    const nearestZombieToMe = getNearestZombieToMe(me, zombies)

  //this funny optimization leads to 200 points more (not much but I should probably start thinking about combo optimization)
  if (humansWithNearestZombies.length === 1) {
    return `${humansWithNearestZombies[0].human.x} ${humansWithNearestZombies[0].human.y}`;
  } 

  const humanWithNearestZombie = humansWithNearestZombies.reduce(
    (acc, curr) =>
      curr.zombieToHumanDistance < acc.zombieToHumanDistance ? curr : acc,
    {
      zombieToHumanDistance: Infinity,
      meToHumanDistance: Infinity,
      meToZombieDistance: Infinity,
      human: {},
      zombie: {},
    } as HumanWithNearestZombie,
  );

  if(nearestZombieToMe.dist < humanWithNearestZombie.zombieToHumanDistance) {
    return `${nearestZombieToMe.zombieX} ${nearestZombieToMe.zombieY}`
  }

  return `${humanWithNearestZombie.zombie.x} ${humanWithNearestZombie.zombie.y}`;
};

const filterUnsavableHumans = (
  humansWithNearestZombies: HumanWithNearestZombie[],
) => {
  return humansWithNearestZombies.filter((humanWithNearestZombie) => {
    const zombieToHumanTime =
      humanWithNearestZombie.zombieToHumanDistance / ZOMBIE_SPEED;
    //for some reson it filters with -1 better
    const meToHumanTime =
      (humanWithNearestZombie.meToHumanDistance - BULLET_DISTANCE) / ME_SPEED -
      1;

    return zombieToHumanTime >= meToHumanTime;
  });
};

// game loop
while (true) {
  const inputs = readline().split(" ");

  const me: Entity = {
    x: parseInt(inputs[0]),
    y: parseInt(inputs[1]),
  };

  const humans = getEntities();

  const zombies = getEntities();

  const humansWithNearestZombies = getHumansWithNearestZombies(
    me,
    humans,
    zombies,
  );

  console.log(
    calcDir(me, zombies, filterUnsavableHumans(humansWithNearestZombies)),
  );
}
