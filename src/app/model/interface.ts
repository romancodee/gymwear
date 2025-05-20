export interface JwtPayload {
    role: string;
    email: string;
    firstname: string;
    lastname: string;
    createdAt: string;
    lastupdate: string;
    isActive: boolean;
    tokenCreatedAt: string;
    exp?: number;
    [key: string]: any;
  }