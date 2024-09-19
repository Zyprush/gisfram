export function capitalizeFirstLetter(string:string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

export function toTitleCase(str:string) {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  

  export function camelCaseToTitleCase(camelCaseStr: string): string {
    // Add space before each capital letter, then capitalize the first letter of each word
    const result = camelCaseStr
      .replace(/([A-Z])/g, " $1") // Insert space before each uppercase letter
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter of the string
      .toLowerCase() // Ensure everything is lowercase initially
      .replace(/\b\w/g, (str) => str.toUpperCase()); // Capitalize the first letter of every word
  
    return result.trim(); // Remove any extra spaces at the start/end
  }
  
  