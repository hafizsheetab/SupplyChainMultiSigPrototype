const web3Instance = require("../config/web3Node");
const supplyChainAbi = require("../abi/SupplyChainAbi.json");
const supplyChainByteCode = require("../abi/SupplyChainByteCode.json");
module.exports = async () => {
    let supplyChain = new web3Instance.eth.Contract(supplyChainAbi);
    let instance = await supplyChain
        .deploy({
            data: supplyChainByteCode.object,
            arguments: [],
        })
        .send({
            from: "0x41a4565dC249bf34bDDd446A9abEfE86533DB48c",
            gas: 3000000,
            gasPrice: "150000000000",
        });
        console.log("Supply Chain Contract Has Been Deployed on " + instance._address)
        
};