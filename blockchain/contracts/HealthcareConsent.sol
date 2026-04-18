// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HealthcareConsent {
    struct Access {
        bool active;
        uint256 expiry;
        string dataScope;
    }

    mapping(address => mapping(address => Access)) public consents;

    event ConsentGranted(address indexed patient, address indexed provider, uint256 expiry);
    event ConsentRevoked(address indexed patient, address indexed provider);
    event AccessLogged(address indexed patient, string action, uint256 timestamp);

    function grantConsent(address provider, uint256 durationInSeconds, string memory dataScope) public {
        consents[msg.sender][provider] = Access(true, block.timestamp + durationInSeconds, dataScope);
        emit ConsentGranted(msg.sender, provider, block.timestamp + durationInSeconds);
    }

    function revokeConsent(address provider) public {
        delete consents[msg.sender][provider];
        emit ConsentRevoked(msg.sender, provider);
    }

    function checkConsent(address patient, address provider) public view returns (bool) {
        Access memory access = consents[patient][provider];
        return access.active && block.timestamp < access.expiry;
    }

    function logAccess(address patient, string memory action) public {
        emit AccessLogged(patient, action, block.timestamp);
    }
}