export function omitProperties<T>(obj: T, keys: (keyof T)[]): Partial<T> {
    // Create a shallow copy of the object to avoid mutating the original
    const result = { ...obj };
  
    // Iterate over the keys to remove them from the object
    keys.forEach(key => {
      delete result[key]; // Delete the property from the result object
    });
  
    return result;
  }
  export function pickProperties<T extends Record<string, any>>(obj: T, keys: (keyof T)[]): Partial<T> {
    const result: Partial<T> = {};
  
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
  
    return result;
  }
  