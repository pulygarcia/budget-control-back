export const generateToken = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100000);
    const combined = timestamp + random;
    const uniqueCode = combined.toString().slice(-6);
  
    return uniqueCode;
}