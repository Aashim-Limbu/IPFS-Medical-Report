import { PinataSDK } from "pinata-web3";

const pinata = new PinataSDK({
    pinataJwt: process.env.PINIATA_JWT as string,
    pinataGateway: "example-gateway.mypinata.cloud",
});
export default pinata;
