console.log("Start of the Page")
// https://viem.sh/docs/getting-started
import { createWalletClient, custom } from 'https://esm.sh/viem';
let walletClient;

async function connect() {
    if (window.ethereum !== undefined) {
        walletClient = createWalletClient({
            transport: custom(window.ethereum)
        });
        const [address] = await walletClient.requestAddresses()
        connectBunnon.innerHTML = "Connected!";
        console.log("address:", address);
    } else {
        connectBunnon.innerHTML = "Please install MetaMask!";
    }
}

const connectBunnon = document.getElementById("connectBunnon");
connectBunnon.onclick = connect;