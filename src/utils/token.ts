import jwt from 'jsonwebtoken'

//6 digits token
export const generateToken = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100000);
    const combined = timestamp + random;
    const uniqueCode = combined.toString().slice(-6);
  
    return uniqueCode;
}

//jwt
export const createJWT = (id:string) => {
    const privateKey = process.env.PRIVATE_KEY_JWT;
    
    if (!privateKey) {
        throw new Error('Private key is not defined in the environment variables');
    }

    return jwt.sign({ id: id }, privateKey,{
        expiresIn: '30d'
    });
}