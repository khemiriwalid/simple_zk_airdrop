# simple_zk_airdrop


Install dependencies: yarn install

Run the UI: yarn run dev

The project consists of three main parts:
* ZK circuit development via circom
* Smart contract development via solidity
* UI via nextjs

In the circuits folder, you will find circom code. 
You must install snarkjs and circom to compile your code and generate proving and verifying keys. 
* snarkjs: https://github.com/iden3/snarkjs
* circom: https://docs.circom.io/getting-started/installation/#installing-dependencies

Commands: 
- circom zkAirdrop.circom --r1cs --wasm --sym -o build
- snarkjs powersoftau new bn128 14 build/powersOfTau28_hez_final_14.ptau -v
- snarkjs powersoftau contribute build/powersOfTau28_hez_final_14.ptau build/pot14_0001.ptau --name="First contribution" -v
- snarkjs powersoftau prepare phase2 build/pot14_0001.ptau build/pot14_final.ptau -v
- snarkjs groth16 setup build/zkAirdrop.r1cs build/pot14_final.ptau build/zkAirdrop_0000.zkey
- snarkjs zkey contribute build/zkAirdrop_0000.zkey build/zkAirdrop.zkey --name="Second Contributor" -v

When you generate the proving key(zkAirdrop.zkey) and witness generation(zkAirdrop.wasm) files, move them into the public folder.

In the contracts folder, we set foundry.

We can generate the verifier smart contract using the following SnarkJS command from the project root: snarkjs zkey export solidityverifier circuits/build/zkAirdrop.zkey contracts/src/Groth16Verifier.sol

Deploy smart contracts via scripts:  forge script script/ZkAirdrop.s.sol ZkAirdropScript --broadcast --verify --rpc-url polygon
