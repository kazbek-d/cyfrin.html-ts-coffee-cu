console.log("Start of the Page")
// https://viem.sh/docs/getting-started
import { createWalletClient, custom, createPublicClient, http } from 'https://esm.sh/viem';
let walletClient;
let publicClient;

function makeWalletClient() {
    walletClient = createWalletClient({
        transport: custom(window.ethereum)
    });
}

async function makePublicClient() {
    publicClient = createPublicClient({
        transport: custom(window.ethereum)
    });
    await publicClient.simulateContract({
        address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
        abi: wagmiAbi,
        functionName: 'mint',
        account,
    })
}

async function connectAndAct(action) {
    if (window.ethereum !== undefined) {
        makeWalletClient();
        connectBunnon.innerHTML = "Connected!";
        await action();
    } else {
        connectBunnon.innerHTML = "Please install MetaMask!";
    }
}

async function connect() {
    async function action() {
        const [address] = await walletClient.requestAddresses()
        console.log("address:", address);
    }
    await connectAndAct(action);
}

async function balance() {
    console.log("balance");
}

async function fund() {
    async function action() {
        await makePublicClient();
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
