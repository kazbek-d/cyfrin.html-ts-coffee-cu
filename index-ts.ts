import {
    createWalletClient,
    custom,
    createPublicClient,
    parseEther,
    defineChain,
    formatEther,
    type WalletClient,
    type PublicClient,
    type Address,
    type Chain
} from 'viem';
import "viem/window";
import { contractAddress, wagmiAbi } from "./constants-ts.ts";

console.log("TS: Start of the Page");

// State variables with explicit types
let walletClient: WalletClient | undefined;
let publicClient: PublicClient | undefined;
let connectedAccount: Address | undefined;
let currentChain: Chain | undefined;

// DOM Elements with specific HTML types
const connectBunnon = document.getElementById("connectBunnon") as HTMLButtonElement;
const balanceBunnon = document.getElementById("balanceBunnon") as HTMLButtonElement;
const fundBunnon = document.getElementById("fundBunnon") as HTMLButtonElement;
const withdrawBunnon = document.getElementById("withdrawBunnon") as HTMLButtonElement;
const ethAmountInput = document.getElementById("ethAmount") as HTMLInputElement;
const amountFunded = document.getElementById("amountFunded") as HTMLInputElement;

async function getCurrentChain(client: WalletClient): Promise<Chain> {
    const chainId = await client.getChainId();
    return defineChain({
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
    });
}

function makeWalletClient(): void {
    walletClient = createWalletClient({
        transport: custom(window.ethereum)
    });
}

async function makePublicClient(): Promise<void> {
    publicClient = createPublicClient({
        transport: custom(window.ethereum)
    });
}

async function connectAndAct(action: () => Promise<void>): Promise<void> {
    if (window.ethereum !== undefined) {
        makeWalletClient();

        if (!walletClient) return;

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

async function connect(): Promise<void> {
    await connectAndAct(async () => {
        console.log("connectBunnon.onclick");
    });
}

async function balance(): Promise<void> {
    await connectAndAct(async () => {
        await makePublicClient();
        if (!publicClient) return;

        const balance = await publicClient.getBalance({
            address: contractAddress as Address,
        });
        console.log("balance: ", formatEther(balance));
    });
}

async function fund(): Promise<void> {
    await connectAndAct(async () => {
        await makePublicClient();
        if (!publicClient || !walletClient || !connectedAccount) return;

        console.log("simulateContract");
        const { request } = await publicClient.simulateContract({
            address: contractAddress as Address,
            abi: wagmiAbi,
            functionName: 'fund',
            account: connectedAccount,
            chain: currentChain,
            value: parseEther(ethAmountInput.value)
        });

        const hash = await walletClient.writeContract(request);
        console.log("hash: ", hash);
        console.log(`Funding with: ${ethAmountInput.value}`);
    });
}

async function withdraw(): Promise<void> {
    await connectAndAct(async () => {
        await makePublicClient();
        if (!publicClient || !walletClient || !connectedAccount) return;

        console.log("simulateContract");
        const { request } = await publicClient.simulateContract({
            address: contractAddress as Address,
            abi: wagmiAbi,
            functionName: 'withdraw',
            account: connectedAccount,
            chain: currentChain
        });

        const hash = await walletClient.writeContract(request);
        console.log("hash: ", hash);
    });
}

async function getAddressToAmountFunded(): Promise<void> {
    await connectAndAct(async () => {
        await makePublicClient();
        if (!publicClient || !walletClient || !connectedAccount) return;

        console.log("readContract");
        const data = await publicClient.readContract({
            address: contractAddress,
            abi: wagmiAbi,
            functionName: 'getAddressToAmountFunded',
            args: [connectedAccount]
        });

        console.log(`${formatEther(data)} ether funded by address ${connectedAccount}`);
    });
}


// Event Listeners
connectBunnon.onclick = connect;
balanceBunnon.onclick = balance;
fundBunnon.onclick = fund;
withdrawBunnon.onclick = withdraw;
amountFunded.onclick = getAddressToAmountFunded;