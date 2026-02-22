console.log("Start of the Page")
// https://viem.sh/docs/getting-started
import { createWalletClient, custom, createPublicClient, parseEther, defineChain, formatEther } from 'https://esm.sh/viem';
import { contractAddress, wagmiAbi } from "./constants-js.js";


let walletClient;
let publicClient;
let connectedAccount;
let currentChain;

async function getCurrentChain(client) {
    const chainId = await client.getChainId()
    const currentChain = defineChain({
        id: chainId,
        name: "Custom Chain",
        nativeCurrency: {
            name: "Ether",
            symbol: "ETH",
            decimals: 18,
        },
        rpcUrls: {
            default: {
                http: ["http://localhost:8545"],
            },
        },
    })
    return currentChain
}

function makeWalletClient() {
    walletClient = createWalletClient({
        transport: custom(window.ethereum)
    });
}

async function makePublicClient() {
    publicClient = createPublicClient({
        transport: custom(window.ethereum)
    });
}

async function connectAndAct(action) {
    if (window.ethereum !== undefined) {
        makeWalletClient();
        connectBunnon.innerHTML = "Connected!";

        const [address] = await walletClient.requestAddresses();
        currentChain = await getCurrentChain(walletClient);
        connectedAccount = address;
        console.log("address:", address);

        await action();
    } else {
        connectBunnon.innerHTML = "Please install MetaMask!";
    }
}

async function connect() {
    async function action() {
        console.log("connectBunnon.onclick");
    }
    await connectAndAct(action);
}

async function balance() {
    async function action() {
        await makePublicClient();
        const balance = await publicClient.getBalance({
            address: contractAddress,
        })
        console.log("balance: ", formatEther(balance));
    }
    await connectAndAct(action);
}

async function fund() {
    async function action() {
        await makePublicClient();

        console.log("simulateContract");
        const { request } = await publicClient.simulateContract({
            address: contractAddress,
            abi: wagmiAbi,
            functionName: 'fund',
            account: connectedAccount,
            chain: currentChain,
            value: parseEther(ethAmountInput.value)
        })
        console.log("request: ", request);

        const hash = await walletClient.writeContract(request);
        console.log("hash: ", hash);

        console.log(`Funding with: ${ethAmountInput.value}`);
    }
    await connectAndAct(action);
}

const connectBunnon = document.getElementById("connectBunnon");
connectBunnon.onclick = connect;

const balanceBunnon = document.getElementById("balanceBunnon");
balanceBunnon.onclick = balance;

const fundBunnon = document.getElementById("fundBunnon");
fundBunnon.onclick = fund;

const ethAmountInput = document.getElementById("ethAmount");
