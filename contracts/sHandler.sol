// SPDX-License-Identifier: Licensed

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ClusterHandler {
    error AllowanceError();
    error OwnerMismatch();
    error OneToOneMismatch();

    event TransferERC20(
        address owner,
        address receiver,
        address token,
        uint256 amount
    );
    event TransferERC721(
        address owner,
        address token,
        address receiver,
        uint256 id
    );
    event TransferMultipleTokensOneERC721(
        address owner,
        address tokenAddress,
        address receiver,
        uint256[] tokenIds
    );

    struct nfts {
        uint256[] ids;
    }
    struct Cluster {
        bytes id;
        mapping(uint256 => address) tokens;
        mapping(address => nfts) ids;
        uint256 tokensSize;
    }
    mapping(bytes => Cluster) private m_cluster;
    mapping(address => uint256[]) private tokenstoIds;

    Cluster[] private clusters;
    Cluster private new_cluster;

    function sendERC20(
        address owner,
        address receiver,
        uint256 amount,
        address tokenAddress
    ) public returns (bool) {
        uint256 allowance = IERC20(tokenAddress).allowance(owner, msg.sender);
        bool success;

        if (allowance >= amount) {
            success = IERC20(tokenAddress).transferFrom(
                owner,
                receiver,
                amount
            );
        } else {
            revert AllowanceError();
        }
        emit TransferERC20(owner, tokenAddress, receiver, amount);
        return success;
    }

    function sendOneERC721(
        address owner,
        address receiver,
        uint256 tokenId,
        address tokenAddress
    ) public returns (bool) {
        address _owner = IERC721(tokenAddress).ownerOf(tokenId);
        bool success;
        if (owner == _owner) {
            IERC721(tokenAddress).transferFrom(owner, receiver, tokenId);
            success = true;
        } else {
            success = false;
            revert OwnerMismatch();
        }
        emit TransferERC721(owner, tokenAddress, receiver, tokenId);
        return success;
    }

    function sendMultipleTokensOneERC721(
        address owner,
        address receiver,
        uint256[] calldata tokenIds,
        address tokenAddress
    ) public returns (bool) {
        bool success;
        for (uint256 i = 0; i < tokenIds.length; i++) {
            address _owner = IERC721(tokenAddress).ownerOf(tokenIds[i]);

            if (owner == _owner) {
                IERC721(tokenAddress).transferFrom(
                    owner,
                    receiver,
                    tokenIds[i]
                );
                success = true;
            } else {
                success = false;
                revert OwnerMismatch();
            }
        }
        emit TransferMultipleTokensOneERC721(
            owner,
            tokenAddress,
            receiver,
            tokenIds
        );
        return success;
    }

    function sendMultipleTokensMultipleERC721(
        address[] calldata addresses,
        uint256[][] calldata ids,
        address owner,
        address receiver
    ) public {
        uint256 i;
        uint256 j;
        for (i = 0; i < addresses.length; i++) {
            uint256[] memory id = ids[i];
            for (j = 0; j < id.length; j++) {
                // address _owner = IERC721(addresses[i]).ownerOf(id[j]);
                // if (_owner == owner){
                //      IERC721(addresses[i]).transferFrom(owner, receiver, id[j]);
                // }
                IERC721(addresses[i]).transferFrom(owner, receiver, id[j]);
            }
        }
    }

    function sendOneTokenMultipleERC721(
        address[] calldata addresses,
        uint256[] calldata ids,
        address owner,
        address receiver
    ) public {
        bool success;
        if (addresses.length != ids.length) revert OneToOneMismatch();
        for (uint256 i = 0; i < addresses.length; i++) {
            address _owner = IERC721(addresses[i]).ownerOf(ids[i]);
            if (owner == _owner) {
                IERC721(addresses[i]).transferFrom(owner, receiver, ids[i]);
                success = true;
            } else {
                success = false;
                revert OwnerMismatch();
            }
        }
    }

    function testWithS_Cluster(
        bytes memory index,
        address owner,
        address reciepient
    ) public returns (bool) {
        bool success;
        Cluster storage c = m_cluster[index];
        uint256 size = c.tokensSize;
        for (uint256 i = 0; i <= size; i++) {
            address token = c.tokens[i];
            nfts memory n = c.ids[token];
            uint256[] memory id = n.ids;
            for (uint256 j = 0; j <= id.length; j++) {
                IERC721(token).safeTransferFrom(owner, reciepient, id[j]);
            }
        }
        success = true;
        return success;
    }

    function pushS_Cluster(
        bytes memory key,
        address[] memory g,
        nfts[] memory calldata_tokenIds,
        address owner,
        address reciepient
    ) public {
        new_cluster.id = key;
        for (uint256 i = 0; i < g.length; i++) {
            new_cluster.tokens[i] = g[i];
            new_cluster.ids[g[i]] = calldata_tokenIds[i];
            new_cluster.tokensSize++;
        }

        uint256 size = new_cluster.tokensSize;
        for (uint256 i = 0; i <= size; i++) {
            address token = new_cluster.tokens[i];
            nfts memory n = new_cluster.ids[token];
            uint256[] memory id = n.ids;
            for (uint256 j = 0; j <= id.length; j++) {
                IERC721(token).safeTransferFrom(owner, reciepient, id[j]);
            }
        }
    }
}
