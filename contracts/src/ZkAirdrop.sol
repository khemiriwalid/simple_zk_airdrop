// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

// Interface to Groth16Verifier.sol
interface IGroth16Verifier {
    function verifyProof(uint[2] memory a, uint[2][2] memory b, uint[2] memory c, uint[2] memory pubSignals) external view returns (bool);
}


contract ZkAirdrop {

    IGroth16Verifier private immutable groth16Verifier;

    uint256 root;

    struct Groth16Proof {
        uint256[2] a;
        uint256[2][2] b;
        uint256[2] c;
    }

    event ProofResult(bool result);

    constructor(IGroth16Verifier _groth16Verifier, uint256 _root) {
        groth16Verifier = _groth16Verifier;
        root= _root;
    }

     function claim(bytes calldata proof) public {
        require(submitProof(proof), "invalid proof");
        //Logic: send ERC20 token the msg.sender
     }

    function submitProof(bytes calldata proof) private returns (bool) {
        uint256[2] memory input = [root, uint256(uint160(address(msg.sender)))];
        Groth16Proof memory groth16Proof = _decodeGroth16ProofCalldata(proof);
        bool result = groth16Verifier.verifyProof(groth16Proof.a, groth16Proof.b, groth16Proof.c, input);
        emit ProofResult(result);
        return result;
    }

      function _decodeGroth16ProofCalldata(bytes calldata proof) public pure returns(Groth16Proof memory decodedProof ) {
        {
            (
                uint256 proof0,
                uint256 proof1,
                uint256 proof2,
                uint256 proof3,
                uint256 proof4,
                uint256 proof5,
                uint256 proof6,
                uint256 proof7
            ) = abi.decode(proof, (uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256));
            decodedProof = Groth16Proof([proof0, proof1],[[proof2, proof3], [proof4, proof5]], [proof6, proof7]);
        }
    }
}