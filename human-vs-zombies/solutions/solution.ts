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
  
  const ZOMBIE_SPEED = 400;
  const ME_SPEED = 1000;
  const BULLET_DISTANCE = 2000;
  
  const getHumans = () => {
    const humans: Entity[] = [];
    const humanCount = parseInt(readline());
    for (let i = 0; i < humanCount; i++) {
      const inputs = readline().split(" ");
      humans.push({
        id: parseInt(inputs[0]),
        x: parseInt(inputs[1]),
        y: parseInt(inputs[2]),
      });
    }
  
    return humans;
  };
  
  const getZombies = () => {
    const zombies: Entity[] = [];
    const zombieCount = parseInt(readline());
    for (let i = 0; i < zombieCount; i++) {
      const inputs = readline().split(" ");
      zombies.push({
        id: parseInt(inputs[0]),
        x: parseInt(inputs[1]),
        y: parseInt(inputs[2]),
      });
    }
    return zombies;
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
  
  const calcDir = (
    me: Entity,
    humansWithNearestZombies: HumanWithNearestZombie[],
  ) => {
    const humanWithNearestZombie = humansWithNearestZombies.reduce(
      (acc, curr) =>
        curr.zombieToHumanDistance + curr.meToHumanDistance <
        acc.zombieToHumanDistance + acc.meToHumanDistance
          ? curr
          : acc,
      {
        zombieToHumanDistance: Infinity,
        meToHumanDistance: Infinity,
          meToZombieDistance: Infinity,
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
      const meToHumanTime = (humanWithNearestZombie.meToHumanDistance - BULLET_DISTANCE) / ME_SPEED;
  
      return zombieToHumanTime > meToHumanTime;
    });
  };
  
  // game loop
  while (true) {
    const inputs = readline().split(" ");
  
    const me: Entity = {
      x: parseInt(inputs[0]),
      y: parseInt(inputs[1]),
    };
  
    const humans = getHumans();
  
    const zombies = getZombies();
  
    const humansWithNearestZombies = getHumansWithNearestZombies(
      me,
      humans,
      zombies,
    );
  
    console.log(calcDir(me, filterUnsavableHumans(humansWithNearestZombies)));
  }
  
