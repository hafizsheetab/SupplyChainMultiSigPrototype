import logo from "./logo.svg";
import "./App.css";
import { ethers } from "ethers";
import { contractAbi, contractAddress } from "./config/vars";
import { useState, useEffect } from "react";

function App() {
    const [state, setState] = useState({
        account: null,
        supplyChainContract: null,
        status: null,
    });
    const [formData, setFormData] = useState({
        idAdd: null,
        receiverAddress: null,
        txId: null,
        idReceive: null,
        idFind: null,
        idShip: null,
    });
    const [errors, setErrors] = useState({
        addProduct: "",
        shipProduct: "",
        receiveProduct: "",
        findProductStatus: "",
    });
    const [events, setEvents] = useState([]);
    const onChangeFormData = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    useEffect(() => {
        if (window.ethereum) {
            const handleAccountChange = (accounts) => {
                const provider = new ethers.providers.Web3Provider(
                    window.ethereum
                );
                const signer = provider.getSigner();
                const supplyChain = new ethers.Contract(
                    contractAddress,
                    contractAbi,
                    signer
                );
                setState({
                    account: accounts[0],
                    supplyChainContract: supplyChain,
                });
            };
            window.ethereum.on("accountsChanged", handleAccountChange);
            return () => {
                window.ethereum.removeListener(
                    "accountsChanged",
                    handleAccountChange
                );
            };
        }
    }, []);
    useEffect(() => {
        if (state.supplyChainContract) {
            state.supplyChainContract.on(
                "ReadyToBeReceived",
                (id, receiver, txIndex) => {
                    setEvents((past) => {
                        let filter = past.filter(
                            (event) =>
                                event.name ===
                                    "Product is Ready To be Received" &&
                                event.id === id.toString()
                        );
                        if (filter.length == 0) {
                            past.push({
                                name: "Product is Ready To be Received",
                                id: id.toString(),
                                receiver,
                                txIndex: txIndex.toString(),
                            });
                        }
                        return [...past];
                    });
                }
            );
            state.supplyChainContract.on(
                "ProductReceived",
                (id, receiver, txIndex) => {
                    setEvents((past) => {
                        let filter = past.filter(
                            (event) =>
                                event.name === "Product Is Received" &&
                                event.id === id.toString()
                        );
                        if (filter.length == 0) {
                            past.push({
                                name: "Product Is Received",
                                id: id.toString(),
                                receiver,
                                txIndex: txIndex.toString(),
                            });
                        }
                        return [...past];
                    });
                }
            );
            return () => {
                state.supplyChainContract.removeAllListeners([
                    "ReadyToBeReceived",
                    "ProductReceived",
                ]);
            };
        }
    }, [state.supplyChainContract]);
    const onClickConnectWallet = () => {
        if (window.ethereum) {
            (async () => {
                const accounts = await window.ethereum.request({
                    method: "eth_requestAccounts",
                });
                const provider = new ethers.providers.Web3Provider(
                    window.ethereum
                );
                const signer = provider.getSigner();
                const supplyChain = new ethers.Contract(
                    contractAddress,
                    contractAbi,
                    signer
                );
                setState({
                    account: accounts[0],
                    supplyChainContract: supplyChain,
                });
            })();
        } else {
            alert("please install metamask");
        }
    };
    const findProductStatus = () => {
        if (state.account) {
            if (formData.idFind) {
                (async () => {
                    try {
                        const productStatus =
                            await state.supplyChainContract.productStatus(
                                formData.idFind
                            );
                        switch (productStatus) {
                            case 0:
                                setState({ ...state, status: "Not Added" });
                                break;
                            case 1:
                                setState({
                                    ...state,
                                    status: "Ready For Sale",
                                });
                                break;
                            case 2:
                                setState({ ...state, status: "Received" });
                                break;
                            default:
                                setState({ ...state, status: "Not Found" });
                        }
                        setErrors({ ...errors, findProductStatus: "" });
                    } catch (err) {
                        console.log(err);
                        setErrors({
                            ...errors,
                            findProductStatus: err.data
                                ? err.data.message
                                : err.message,
                        });
                    }
                })();
            } else {
                alert("Type in Product Id");
            }
        } else {
            alert("Connect Metamask");
        }
    };
    const addProduct = () => {
        if (state.account) {
            if (formData.idAdd) {
                (async () => {
                    try {
                        const result =
                            await state.supplyChainContract.addProduct(
                                formData.idAdd
                            );
                        console.log(result);
                        setErrors({ ...errors, addProduct: "" });
                    } catch (err) {
                        console.log(err);
                        setErrors({
                            ...errors,
                            addProduct: err.data
                                ? err.data.message
                                : err.message,
                        });
                    }
                })();
            } else {
                alert("Type in Product Id");
            }
        } else {
            alert("Connect Metamask");
        }
    };
    const shipProduct = () => {
        if (state.account) {
            if (formData.idShip && formData.receiverAddress) {
                (async () => {
                    try {
                        const result =
                            await state.supplyChainContract.shipProduct(
                                formData.idShip,
                                formData.receiverAddress
                            );
                        console.log(result);
                        setErrors({ ...errors, shipProduct: "" });
                    } catch (err) {
                        console.log(err);
                        setErrors({
                            ...errors,
                            shipProduct: err.data
                                ? err.data.message
                                : err.message,
                        });
                    }
                })();
            } else {
                alert("Type In Product Id and receiver Address");
            }
        } else {
            alert("Connect Metamask");
        }
    };
    const receiveProduct = () => {
        if (state.account) {
            if (formData.idReceive && formData.txId) {
                (async () => {
                    try {
                        const result =
                            await state.supplyChainContract.receiveProduct(
                                formData.idReceive,
                                formData.txId
                            );
                        console.log(result);
                        setErrors({ ...errors, receiveProduct: "" });
                    } catch (err) {
                        console.log(err);
                        setErrors({
                            ...errors,
                            receiveProduct: err.data
                                ? err.data.message
                                : err.message,
                        });
                    }
                })();
            } else {
                alert("Type In Product Id and Transaction Id");
            }
        } else {
            alert("Connect Metamask");
        }
    };
    const onClickClearError = (e) => {
      setErrors({...errors, [e.target.name]: ""})
    }
    return (
        <div className="App">
            {!state.account && (
                <button onClick={onClickConnectWallet}>Connect Wallet</button>
            )}
            {state.account && <button>Wallet Connected</button>}
            <br />
            <tex>Account Address: {state.account}</tex>
            <br />
            <br />
            <input
                type="text"
                placeholder="Product Id"
                name="idAdd"
                value={formData.idAdd}
                onChange={onChangeFormData}
            ></input>
            <button onClick={addProduct}>Add Product</button>
            <br />
            <text style={{ color: "red" }}>{errors.addProduct}</text>
            {errors.addProduct && <button name="addProduct" onClick={onClickClearError}>Clear Error</button>}
            <br />
            <br />
            <input
                type="text"
                placeholder="Product Id"
                name="idShip"
                value={formData.idShip}
                onChange={onChangeFormData}
            ></input>
            <input
                type="text"
                placeholder="Receiver Wallet Address"
                name="receiverAddress"
                value={formData.receiverAddress}
                onChange={onChangeFormData}
            ></input>
            <button onClick={shipProduct}>Ship Product To The Receiver</button>
            <br />
            <text style={{ color: "red" }}>{errors.shipProduct}</text>
            {errors.shipProduct && <button name="shipProduct" onClick={onClickClearError}>Clear Error</button>}
            <br />
            <br />
            <input
                type="text"
                placeholder="Product Id"
                name="idReceive"
                value={formData.idReceive}
                onChange={onChangeFormData}
            ></input>
            <input
                type="text"
                placeholder="txIndex"
                name="txId"
                value={formData.txId}
                onChange={onChangeFormData}
            ></input>
            <button onClick={receiveProduct}>
                Receive Product By Receiver
            </button>
            <br />
            <text style={{ color: "red" }}>{errors.receiveProduct}</text>
            {errors.receiveProduct && <button name="receiveProduct" onClick={onClickClearError}>Clear Error</button>}
            <br />
            <br />
            <input
                type="text"
                placeholder="Product Id"
                name="idFind"
                value={formData.idFind}
                onChange={onChangeFormData}
            ></input>
            <button onClick={findProductStatus}>Find Product Status</button>
            <br />
            <text>Product Status: {state.status}</text>
            <br />
            <text style={{ color: "red" }}>{errors.findProductStatus}</text>
            {errors.findProductStatus &&<button name="findProductStatus" onClick={onClickClearError}>Clear Error</button>}
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <h2>Events: </h2>
            {console.log(events)}
            {events.map((event) => (
                <div style={{ border: "1px solid" }}>
                    <text>
                        <h3>Type: </h3> {event.name}
                    </text>

                    <text>
                        <h3>Product Id:</h3>
                        {event.id}
                    </text>

                    <text>
                        <h3>Receiver Address: </h3>
                        {event.receiver}
                    </text>

                    <text>
                        <h3>TxIndex: </h3>
                        {event.txIndex}
                    </text>
                </div>
            ))}
        </div>
    );
}

export default App;
