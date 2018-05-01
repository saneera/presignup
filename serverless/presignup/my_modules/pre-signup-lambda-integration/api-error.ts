
export class ApiError implements Error {
    readonly code?: string | number;
    readonly stack?: string;
  
    constructor(
      readonly message: string = 'Internal server error',
      readonly errors?: string[],
      code: string | number = 500,
      readonly name: string ='',
    ) {
      this.code = code;
    }
  
   
  };