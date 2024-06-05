export function removeEmptyEntityFromObject(object: { [key: string]: any }) {
  return Object.entries(object)
    .filter(([, value]) => value !== '')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
}

export function parseStringToArrayOfObjects(str: string) {
  try {
    const initialArray = JSON.parse(str);
    const arrayOfObjects = initialArray.map((item: any) => {
      return typeof item === 'string' ? JSON.parse(item) : item;
    });
    return arrayOfObjects;
  } catch (error) {
    throw error;
  }
}
