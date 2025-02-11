pragma circom 2.0.0;

include "./merkleTreeInclusionProof.circom";

template ZkAirdrop(treeLevels) {
    signal input accountAddress;

    signal input siblings[treeLevels];
    signal input pathIndices[treeLevels];

    signal output root;

    component merkleTreeInclusionProof = MerkleTreeInclusionProof(treeLevels);
    merkleTreeInclusionProof.leaf <== accountAddress;
    for (var i=0; i<treeLevels; i++) {
        merkleTreeInclusionProof.siblings[i] <== siblings[i];
        merkleTreeInclusionProof.pathIndices[i] <== pathIndices[i];
    }

    root <== merkleTreeInclusionProof.root;
}

component main {public [ accountAddress ]} = ZkAirdrop(2);