import friendlyWords from 'friendly-words';

export function generateProjectName(): string {
  const adj =
    friendlyWords.predicates[
      Math.floor(Math.random() * friendlyWords.predicates.length)
    ];
  const obj =
    friendlyWords.objects[
      Math.floor(Math.random() * friendlyWords.objects.length)
    ];
  return `${adj} ${obj}`;
}

export function generateCollectionName(): string {
  const adj =
    friendlyWords.predicates[
      Math.floor(Math.random() * friendlyWords.predicates.length)
    ];
  return `My ${adj} collection`;
}
