export type Dict<T> = { [key: string]: T };

export interface SignUpUserEvent {
    triggerSource: string;
    userName: string;
    userPoolId: string;
    clientId: string;
    request: {
      userAttributes: Dict<string>;
    };
}
