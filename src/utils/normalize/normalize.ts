import { Entity } from '../../typings/API';

const normalize = (data: Entity | Entity[]) => {
  if (Array.isArray(data)) {
    return data.reduce(
      (normalizedEntities, entity) => ({
        ...normalizedEntities,
        [entity.id]: entity,
      }),
      {},
    );
  }

  if (Object.keys(data).length === 0) {
    return data;
  }

  return {
    [data.id]: data,
  };
};

export default normalize;
