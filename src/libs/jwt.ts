import { sign, verify } from 'hono/jwt'

interface JWTVerifyPayload {
    sub: {
        user_id: string;
    },
    exp: number;
}

export const getEncodedSecret = async () => {
    const secret = process.env.SECRET_TOKEN;
    if (!secret) throw new Error("Secret token is not defined");
    
    const buffer = new TextEncoder().encode(secret).buffer;
    const array = Array.from(new Uint8Array(buffer));
    
    return array.join(',');
};  

export const createJwt = async ( userId : string ) => {
    const secret = await getEncodedSecret();

    const payload =  {
        sub: {
            user_id: userId,
        },
        exp: Math.floor(Date.now() / 1000) + 60 * 5,
    }

    const token = await sign(payload, secret);
    return token;
}

export const verifyJwt = async ( token : string ):Promise<JWTVerifyPayload | null> =>  {
    const secret = await getEncodedSecret();
    try {
        const decodedPayload = await verify(token, secret)
        return decodedPayload as unknown as JWTVerifyPayload;

    } catch (error) {
        console.log((error as any));
        return null;
    }

}
